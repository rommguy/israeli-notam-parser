import { NOTAM, PlaywrightConfig } from "./types";
import { initParser, fetchNotams } from "./scraper";

export const fetchNotamsWithPlaywright = async (
  existingNotamIds: string[] = [],
  config: Partial<PlaywrightConfig> = {},
): Promise<NOTAM[]> => {
  try {
    const page = await initParser(config);
    return await fetchNotams(page, existingNotamIds);
  } finally {
    await [];
  }
};
