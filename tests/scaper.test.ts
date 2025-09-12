import { parseDate, parseAaBc, parseQ } from "../src/scraper";

describe("scaper tests", () => {
  describe("parseDate", () => {
    it("should parse valid date string in YYMMDDHHMM format", () => {
      const dateString = "2509141430";
      const result = parseDate(dateString);

      // Verify the parsed date components
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(8); // January is 0-indexed
      expect(result.getDate()).toBe(14);
      expect(result.getUTCHours()).toBe(14);
      expect(result.getMinutes()).toBe(30);
    });

    it("should throw error for date string with incorrect length", () => {
      const invalidDateString = "250115143"; // 9 characters instead of 10

      expect(() => parseDate(invalidDateString)).toThrow(
        "Date string must be exactly 10 characters (YYMMDDHHMM)",
      );
    });
  });

  describe("parseAaBc", () => {
    const validAllMoreMsgText = [
      "D) LLLL E) LLLL",
      "A) LLLL B) 2509070500 C) 2509181500",
      "Q) LLLL/QWULW/IV/BO /W /000/010/3149N03458E001",
    ];

    const noDatesAllMoreMsgText = [
      "D) LLLL E) LLLL",
      "A) LLLL C) 2509181500",
      "Q) LLLL/QWULW/IV/BO /W /000/010/3149N03458E001",
    ];

    it("should parse valid AaBc string", () => {
      const result = parseAaBc("1234567890", validAllMoreMsgText);

      expect(result).toEqual({
        icaoCode: "LLLL",
        validFrom: new Date(Date.UTC(2025, 8, 7, 5, 0)),
        validTo: new Date(Date.UTC(2025, 8, 18, 15, 0)),
      });
    });

    it("should return null if AaBc string is not found", () => {
      const allMoreMsgText = ["D) LLLL E) LLLL"];
      const result = parseAaBc("1234567890", allMoreMsgText);
      expect(result).toEqual({
        icaoCode: "",
        validFrom: null,
        validTo: null,
      });
    });

    it(" should return dates null if missing date parts", () => {
      const result = parseAaBc("1234567890", noDatesAllMoreMsgText);
      expect(result).toEqual({
        icaoCode: "",
        validFrom: null,
        validTo: null,
      });
    });
  });

  describe("parseQ", () => {
    it("should parse coordinates and generate Google Maps URL", async () => {
      const testData = [
        "D) LLLL E) LLLL",
        "A) LLLL B) 2509070500 C) 2509181500",
        "Q) LLLL/QWULW/IV/BO /W /000/010/3238N03527E010",
      ];

      const result = await parseQ("TEST123", testData);

      expect(result.mapLink).toBe("https://www.google.com/maps?q=32.63,35.45");
    });

    it("should handle different coordinate formats", async () => {
      const testData = ["Q) LLLL/QWULW/IV/BO /W /000/010/4012N07408E005"];

      const result = await parseQ("TEST123", testData);

      // 4012N = 40.12°N, 07408E = 74.08°E
      expect(result.mapLink).toBe("https://www.google.com/maps?q=40.20,74.13");
    });

    it("should return empty string when Q) section is not found", async () => {
      const testData = [
        "D) LLLL E) LLLL",
        "A) LLLL B) 2509070500 C) 2509181500",
      ];

      const result = await parseQ("TEST123", testData);

      expect(result.mapLink).toBe("");
    });

    it("should return empty string when coordinates format is invalid", async () => {
      const testData = ["Q) LLLL/QWULW/IV/BO /W /000/010/INVALIDFORMAT"];

      const result = await parseQ("TEST123", testData);

      expect(result.mapLink).toBe("");
    });

    it("should handle coordinates with leading zeros", async () => {
      const testData = ["Q) LLLL/QWULW/IV/BO /W /000/010/0105N00203E001"];

      const result = await parseQ("TEST123", testData);

      // 0105N = 01.05°N, 00203E = 02.03°E
      expect(result.mapLink).toBe("https://www.google.com/maps?q=1.08,2.05");
    });

    it("should handle edge case with maximum coordinates", async () => {
      const testData = ["Q) LLLL/QWULW/IV/BO /W /000/010/8999N17999E001"];

      const result = await parseQ("TEST123", testData);

      // 8999N = 89.99°N, 17999E = 179.99°E
      expect(result.mapLink).toBe("https://www.google.com/maps?q=90.65,180.65");
    });
  });
});
