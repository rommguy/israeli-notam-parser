import {
  chromium,
  Browser,
  Page,
  BrowserContext,
  ElementHandle,
} from "playwright";
import * as cheerio from "cheerio";
import { NOTAM, PlaywrightConfig, NotamExpansionResult } from "./types";
import { cleanText, extractDates, extractMapLink } from "./scraperUtils";
import { parse } from "date-fns";

// Constants
const BASE_URL = "https://brin.iaa.gov.il/aeroinfo/AeroInfo.aspx?msgType=Notam";

const DEFAULT_CONFIG: PlaywrightConfig = {
  headless: true,
  timeout: 30000,
  viewport: { width: 1280, height: 720 },
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  slowMo: 100,
  devtools: false,
};

/**
 DOM structure of the NOTAM page:
 * document.querySelectorAll('[id^=divMainInfo]').length - brings all main info divs for NOTAMs - the item id is after _ for example id=divMainInfo_1920055
 * document.querySelectorAll('[id^=divMoreInfo]').length - brings all more info divs for NOTAMs - same item id as the main info for example id=divMoreInfo_1920055
 * both divs are nested under a <td> element
 * When expanding - the main info div gets display:none, the more info gets display:inline and the other way around when collapsing
 * 
 * Parsing logic plan:
 * Fetch and parse NOTAMs with dynamic content expansion*
 * Start by finding all main info divs, the extract the item ids from them and the NOTAM id from their content
 * the NOTAM id is in the first element under the main info div with class "NotamID"
 * For each NOTAM in the page:
 *   If that NOTAM id is already parsed skip it
 *   Find all elements under the main info div with class "MsgText" and combine their content - that's the NOTAM content
 *   Then Expand that notam
 *   Expanding is done by clicking on the first <img> element under the main info div
 *   Wait for the display property to become "none" for the main info and not "none" for the more info div with the same item id.
 *   Then, extract data from the more info
 *   find the <td> element with A) B) and C) and extract ICAO code A), valid from B) and valid to C). Example -  A) LLLL B) 2509070500 C) 2509181500
 *   Find the <td> element with D) and add that to the content field before the content extracted from the MsgText elements
 *   find the <td> element with Q) and read the coordinates if exist. example Q) LLLL/QWMLW/IV/BO /W /000/120/3105N03454E001
 *   
 *
 */

const parseDate = (dateString: string): Date => {
  if (dateString.length !== 10) {
    throw new Error("Date string must be exactly 10 characters (YYMMDDHHMM)");
  }
  return parse(dateString, "yyMMddHHmm", new Date());
};

const expandNotam = async (page: Page, itemId: string) => {
  const mainInfoDiv = await page.$(`[id=divMainInfo_${itemId}]`);
  if (!mainInfoDiv) {
    console.error(
      `Main info or more info div not found for item id: ${itemId}`
    );
    return;
  }

  const img = await mainInfoDiv.$("img");
  if (!img) {
    console.error(`Img element not found for item id: ${itemId}`);
    return;
  }
  await img.click();

  await page.waitForFunction((itemId: string) => {
    const moreInfoDiv = document.getElementById(`divMoreInfo_${itemId}`);
    const moreInfoElm = moreInfoDiv?.querySelectorAll(".more_MsgText") || [];
    return (
      document.getElementById(`divMainInfo_${itemId}`)?.style.display ===
        "none" &&
      moreInfoDiv?.style.display !== "none" &&
      moreInfoElm.length > 0
    );
  }, itemId);
};

const createNotam = (data: Partial<NOTAM> & { id: string }): NOTAM => {
  return {
    id: data.id,
    icaoCode: data.icaoCode || "",
    number: data.number || "",
    year: data.year || "",
    description: data.description || "",
    validFrom: data.validFrom || new Date(),
    validTo: data.validTo || new Date(),
    createdDate: new Date(),
    rawText: data.rawText || "",
  };
};

const parseAaBc = async (
  notamId: string,
  itemId: string,
  moreInfoDiv: ElementHandle<HTMLTableCellElement>
): Promise<{ icaoCode: string; validFrom: Date; validTo: Date }> => {
  const allMoreMsgElm = await moreInfoDiv.$$(".more_MsgText");
  const allMoreMsgText = await Promise.all(
    allMoreMsgElm.map(async (elm) => await elm.innerText())
  );
  const aBcText = allMoreMsgText.find((text) => text.includes("A)"));
  const aBcMatch = aBcText?.match(
    /A\)\s+(\w+)\s+B\)\s+(\d{10})\s+C\)\s+(\d{10})/
  );

  const icaoCodeRaw = aBcMatch?.[1];
  const validFromRaw = aBcMatch?.[2];
  const validToRaw = aBcMatch?.[3];
  if (!icaoCodeRaw || !validFromRaw || !validToRaw) {
    console.error(
      `ICAO code, valid from or valid to not found for item id: ${itemId}, notam id: ${notamId}`
    );
    return createNotam({
      id: notamId,
    });
  }
  const icaoCode = icaoCodeRaw.trim();
  const validFrom = parseDate(validFromRaw.trim());
  const validTo = parseDate(validToRaw.trim());
  return { icaoCode, validFrom, validTo };
};

const parseNotam =
  (page: Page) =>
  async ({
    notamId,
    itemId,
  }: {
    notamId: string;
    itemId: string;
  }): Promise<NOTAM> => {
    const mainInfoDiv = await page.$(`[id=divMainInfo_${itemId}]`);

    if (!mainInfoDiv) {
      console.error(
        `Main info or more info div not found for item id: ${itemId}, notam id: ${notamId}`
      );
      return createNotam({
        id: notamId,
      });
    }

    const notamContentElements = await mainInfoDiv.$$(".MsgText");
    const notamContent = await Promise.all(
      notamContentElements.map(async (element) => {
        return await element.innerText();
      })
    );
    await expandNotam(page, itemId);
    const moreInfoDiv = await page.$(`[id=divMoreInfo_${itemId}]`);
    if (!moreInfoDiv) {
      console.error(
        `More info div not found for item id: ${itemId}, notam id: ${notamId}`
      );
      return createNotam({
        id: notamId,
      });
    }
    const { icaoCode, validFrom, validTo } = await parseAaBc(
      notamId,
      itemId,
      moreInfoDiv as ElementHandle<HTMLTableCellElement>
    );

    return createNotam({
      id: notamId,
      icaoCode,
      validFrom,
      validTo,
      description: notamContent.join(" "),
      rawText: notamContent.join(" "),
    });
  };

export const fetchNotams = async (
  page: Page,
  existingNotamIds: string[]
): Promise<NOTAM[]> => {
  const mainInfoDivs = await page.$$("[id^=divMainInfo]");
  const allItems: Array<{ itemId: string; notamId: string }> =
    await Promise.all(
      mainInfoDivs.map(async (div) => {
        const itemId = (await div.getAttribute("id"))?.split("_")[1];
        if (!itemId) {
          return { itemId: "", notamId: "" };
        }

        const notamIdElm = (await div.$$(".NotamID"))?.[0];
        const notamId = (await notamIdElm?.innerText()).trim();

        return { itemId, notamId };
      })
    );
  const itemsToParse = allItems.filter(
    (item) => !existingNotamIds.includes(item.notamId)
  );

  const parsedNotams: NOTAM[] = [];
  for (const item of itemsToParse) {
    const parsedNotam = await parseNotam(page)(item);
    parsedNotams.push(parsedNotam);
  }

  return parsedNotams;
};

export const initParser = async (
  config: Partial<PlaywrightConfig>
): Promise<Page> => {
  console.log("Launching browser...");
  const browser = await chromium.launch({
    headless: config.headless,
    slowMo: config.slowMo,
    devtools: config.devtools,
  });

  const context = await browser.newContext({
    viewport: config.viewport,
    userAgent: config.userAgent,
  });

  const page = await context.newPage();

  console.log("Navigating to NOTAM website...");

  await page.goto(BASE_URL, {
    waitUntil: "networkidle",
  });

  console.log("Browser initialized successfully");
  console.log("Waiting for NOTAM content to load...");

  await page.waitForSelector("#DataList1");

  return page;
};
