import { promises as fs } from "fs";
import {
  fetchAndParseNotamsIncremental,
  exportDailyNotamsFromStorage,
} from "../src/parser";

// Mock the Playwright scraper to avoid actual browser automation in tests
jest.mock("../src/scraper", () => ({
  fetchNotamsWithPlaywright: jest.fn().mockResolvedValue([
    {
      id: "A9999/25",
      icaoCode: "LLBG",
      type: "A",
      number: "9999",
      year: "25",
      description: "Mock NOTAM from Playwright",
      createdDate: new Date("2025-01-03T12:00:00Z"),
      rawText: "A9999/25 LLBG E) Mock NOTAM from Playwright",
      isExpanded: true,
      expandedContent:
        "Expanded mock content with dates FROM 2501031200 TO 2501031800",
    },
  ]),
}));

// Mock the traditional scraper to return empty results (simulating Playwright preference)
jest.mock("../src/scraper", () => ({
  fetchNotams: jest
    .fn()
    .mockResolvedValue("<html><body>Mock HTML</body></html>"),
  parseHtmlContent: jest.fn().mockReturnValue([]),
}));

// Test data directory
const testDataDir = "./test-integration-data";

describe("Parser Integration", () => {
  beforeEach(async () => {
    // Clean up test directory and reset mocks
    try {
      await fs.rm(testDataDir, { recursive: true, force: true });
      await fs.rm("./data", { recursive: true, force: true });
    } catch (error) {
      // Directory might not exist
    }

    // Reset mocks to default behavior
    const mockPlaywright = require("../src/playwrightScraper");
    mockPlaywright.fetchNotamsWithPlaywright.mockClear();
    mockPlaywright.fetchNotamsWithPlaywright.mockResolvedValue([
      {
        id: "A9999/25",
        icaoCode: "LLBG",
        type: "A",
        number: "9999",
        year: "25",
        description: "Mock NOTAM from Playwright",
        createdDate: new Date("2025-01-03T12:00:00Z"),
        rawText: "A9999/25 LLBG E) Mock NOTAM from Playwright",
        isExpanded: true,
        expandedContent:
          "Expanded mock content with dates FROM 2501031200 TO 2501031800",
      },
    ]);

    const mockScraper = require("../src/scraper");
    mockScraper.parseHtmlContent.mockClear();
    mockScraper.parseHtmlContent.mockReturnValue([]);
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDataDir, { recursive: true, force: true });
      await fs.rm("./data", { recursive: true, force: true });
    } catch (error) {
      // Directory might not exist
    }
  });

  describe("fetchAndParseNotamsIncremental", () => {
    it("should fetch new NOTAMs and merge with existing storage", async () => {
      // Mock storage configuration
      const originalEnv = process.env;

      try {
        // First run - should get the mock NOTAM
        const result1 = await fetchAndParseNotamsIncremental(true, {
          headless: true,
          timeout: 5000,
          viewport: { width: 1280, height: 720 },
        });

        expect(result1.notams).toHaveLength(1);
        expect(result1.notams[0].id).toBe("A9999/25");
        expect(result1.notams[0].isExpanded).toBe(true);
        expect(result1.newCount).toBe(1);

        // Second run - should not fetch the same NOTAM again
        const result2 = await fetchAndParseNotamsIncremental(true);

        expect(result2.notams).toHaveLength(1); // Still has the same NOTAM
        expect(result2.newCount).toBe(0); // No new NOTAMs
      } finally {
        process.env = originalEnv;
      }
    }, 30000); // Longer timeout for integration test

    it("should fail if Playwright fails (no fallback for safety)", async () => {
      // Mock Playwright to fail
      const mockPlaywright = require("../src/playwrightScraper");
      mockPlaywright.fetchNotamsWithPlaywright.mockRejectedValueOnce(
        new Error("Playwright failed")
      );

      // Should throw error instead of falling back to dangerous partial data
      await expect(fetchAndParseNotamsIncremental(true)).rejects.toThrow(
        "Playwright failed"
      );
    }, 10000);
  });

  describe("exportDailyNotamsFromStorage", () => {
    it("should export NOTAMs from storage without fetching", async () => {
      // First, populate storage
      await fetchAndParseNotamsIncremental(true);

      const exportPath = "./test-export.json";

      try {
        await exportDailyNotamsFromStorage("2025-01-03", exportPath);

        // Verify export file was created
        const exists = await fs
          .access(exportPath)
          .then(() => true)
          .catch(() => false);
        expect(exists).toBe(true);

        // Verify content
        const exportedContent = await fs.readFile(exportPath, "utf-8");
        const exportedData = JSON.parse(exportedContent);

        expect(exportedData.notams).toHaveLength(1);
        expect(exportedData.date).toBe("2025-01-03");
      } finally {
        // Clean up export file
        try {
          await fs.unlink(exportPath);
        } catch (error) {
          // File might not exist
        }
      }
    }, 10000);
  });
});
