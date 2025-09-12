import { parseDate } from "../src/playwrightScraper";

describe("parseDate", () => {
  it("should parse valid date string in YYMMDDHHMM format", () => {
    // Test with date: January 15, 2025, 14:30 UTC
    const dateString = "2501151430";
    const result = parseDate(dateString);

    // Verify the parsed date components
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(0); // January is 0-indexed
    expect(result.getDate()).toBe(15);
    expect(result.getHours()).toBe(14);
    expect(result.getUTCHours()).toBe(14);
    expect(result.getMinutes()).toBe(30);
  });

  it("should throw error for date string with incorrect length", () => {
    const invalidDateString = "250115143"; // 9 characters instead of 10

    expect(() => parseDate(invalidDateString)).toThrow(
      "Date string must be exactly 10 characters (YYMMDDHHMM)"
    );
  });
});
