import { parseHtmlContent } from '../src/scraper';

describe('extractDates functionality', () => {
  describe('Pattern 1: Standard NOTAM format (FROM YYMMDDHHMM TO YYMMDDHHMM)', () => {
    it('should extract dates from FROM/TO pattern', () => {
      const html = `
        <div>A1234/25 LLBG E) TEST NOTAM FROM 2501011200 TO 2501011800</div>
      `;

      const result = parseHtmlContent(html);

      expect(result).toHaveLength(1);
      expect(result[0].validFrom).toEqual(new Date(2025, 0, 1, 12, 0)); // Jan 1, 2025, 12:00
      expect(result[0].validTo).toEqual(new Date(2025, 0, 1, 18, 0)); // Jan 1, 2025, 18:00
    });

    it('should extract dates from FM/TILL pattern', () => {
      const html = `
        <div>C5678/25 LLLL E) TEST NOTAM FM 2501020900 TILL 2501022100</div>
      `;

      const result = parseHtmlContent(html);

      expect(result).toHaveLength(1);
      expect(result[0].validFrom).toEqual(new Date(2025, 0, 2, 9, 0)); // Jan 2, 2025, 09:00
      expect(result[0].validTo).toEqual(new Date(2025, 0, 2, 21, 0)); // Jan 2, 2025, 21:00
    });

    it('should handle cross-day validity periods', () => {
      const html = `
        <div>R9999/25 LLTB E) OVERNIGHT CLOSURE FROM 2501012200 TO 2501020600</div>
      `;

      const result = parseHtmlContent(html);

      expect(result).toHaveLength(1);
      expect(result[0].validFrom).toEqual(new Date(2025, 0, 1, 22, 0)); // Jan 1, 2025, 22:00
      expect(result[0].validTo).toEqual(new Date(2025, 0, 2, 6, 0)); // Jan 2, 2025, 06:00
    });

    it('should handle cross-month validity periods', () => {
      const html = `
        <div>N0001/25 LLHA E) CROSS MONTH FROM 2501312300 TO 2502010100</div>
      `;

      const result = parseHtmlContent(html);

      expect(result).toHaveLength(1);
      expect(result[0].validFrom).toEqual(new Date(2025, 0, 31, 23, 0)); // Jan 31, 2025, 23:00
      expect(result[0].validTo).toEqual(new Date(2025, 1, 1, 1, 0)); // Feb 1, 2025, 01:00
    });
  });

  describe('Pattern 2: Alternative date format (FROM DD MMM YYYY HH:MM TO DD MMM YYYY HH:MM)', () => {
    it('should extract dates from VALID FROM/TO pattern', () => {
      const html = `
        <div>A2468/25 LLBG E) RUNWAY CLOSURE VALID FROM 15 JAN 2025 08:30 TO 15 JAN 2025 17:45</div>
      `;

      const result = parseHtmlContent(html);

      expect(result).toHaveLength(1);
      expect(result[0].validFrom).toEqual(new Date(2025, 0, 15, 8, 30)); // Jan 15, 2025, 08:30
      expect(result[0].validTo).toEqual(new Date(2025, 0, 15, 17, 45)); // Jan 15, 2025, 17:45
    });

    it('should extract dates from simple FROM/TO pattern without VALID prefix', () => {
      const html = `
        <div>C1357/25 LLLL E) NAVIGATION AID FROM 20 FEB 2025 14:00 TO 20 FEB 2025 18:00</div>
      `;

      const result = parseHtmlContent(html);

      expect(result).toHaveLength(1);
      expect(result[0].validFrom).toEqual(new Date(2025, 1, 20, 14, 0)); // Feb 20, 2025, 14:00
      expect(result[0].validTo).toEqual(new Date(2025, 1, 20, 18, 0)); // Feb 20, 2025, 18:00
    });

    it('should handle different months in from/to dates', () => {
      const html = `
        <div>R4321/25 LLTB E) EXTENDED CLOSURE FROM 28 JAN 2025 10:00 TO 03 FEB 2025 16:00</div>
      `;

      const result = parseHtmlContent(html);

      expect(result).toHaveLength(1);
      expect(result[0].validFrom).toEqual(new Date(2025, 0, 28, 10, 0)); // Jan 28, 2025, 10:00
      expect(result[0].validTo).toEqual(new Date(2025, 1, 3, 16, 0)); // Feb 3, 2025, 16:00
    });

    it('should handle all month abbreviations', () => {
      const months = [
        { abbr: 'JAN', num: 0 }, { abbr: 'FEB', num: 1 }, { abbr: 'MAR', num: 2 },
        { abbr: 'APR', num: 3 }, { abbr: 'MAY', num: 4 }, { abbr: 'JUN', num: 5 },
        { abbr: 'JUL', num: 6 }, { abbr: 'AUG', num: 7 }, { abbr: 'SEP', num: 8 },
        { abbr: 'OCT', num: 9 }, { abbr: 'NOV', num: 10 }, { abbr: 'DEC', num: 11 }
      ];

      months.forEach(month => {
        const html = `
          <div>A1111/25 LLBG E) MONTH TEST FROM 15 ${month.abbr} 2025 12:00 TO 15 ${month.abbr} 2025 14:00</div>
        `;

        const result = parseHtmlContent(html);

        expect(result).toHaveLength(1);
        expect(result[0].validFrom).toEqual(new Date(2025, month.num, 15, 12, 0));
        expect(result[0].validTo).toEqual(new Date(2025, month.num, 15, 14, 0));
      });
    });
  });

  describe('Pattern 3: Single date patterns (WEF, TILL, UNTIL)', () => {
    it('should extract validFrom date from WEF (With Effect From) pattern', () => {
      const html = `
        <div>N7890/25 LLHA E) NEW PROCEDURE WEF 10 MAR 2025</div>
      `;

      const result = parseHtmlContent(html);

      expect(result).toHaveLength(1);
      expect(result[0].validFrom).toEqual(new Date(2025, 2, 10, 0, 0)); // Mar 10, 2025, 00:00
      expect(result[0].validTo).toBeUndefined();
    });

    it('should extract validTo date from TILL pattern with time', () => {
      const html = `
        <div>A0987/25 LLBG E) TEMPORARY CLOSURE TILL 25 APR 2025 23:59</div>
      `;

      const result = parseHtmlContent(html);

      expect(result).toHaveLength(1);
      expect(result[0].validFrom).toBeUndefined();
      expect(result[0].validTo).toEqual(new Date(2025, 3, 25, 23, 59)); // Apr 25, 2025, 23:59
    });

    it('should extract validTo date from TILL pattern without time (defaults to 23:59)', () => {
      const html = `
        <div>C6543/25 LLLL E) AIRSPACE RESTRICTION TILL 30 JUN 2025</div>
      `;

      const result = parseHtmlContent(html);

      expect(result).toHaveLength(1);
      expect(result[0].validFrom).toBeUndefined();
      expect(result[0].validTo).toEqual(new Date(2025, 5, 30, 23, 59)); // Jun 30, 2025, 23:59
    });

    it('should extract validTo date from UNTIL pattern', () => {
      const html = `
        <div>R2109/25 LLTB E) RADAR SERVICE UNAVAILABLE UNTIL 15 AUG 2025 12:30</div>
      `;

      const result = parseHtmlContent(html);

      expect(result).toHaveLength(1);
      expect(result[0].validFrom).toBeUndefined();
      expect(result[0].validTo).toEqual(new Date(2025, 7, 15, 12, 30)); // Aug 15, 2025, 12:30
    });

    it('should handle combination of WEF and TILL patterns', () => {
      const html = `
        <div>A8765/25 LLBG E) CONSTRUCTION WORK WEF 01 SEP 2025 TILL 15 SEP 2025</div>
      `;

      const result = parseHtmlContent(html);

      expect(result).toHaveLength(1);
      expect(result[0].validFrom).toEqual(new Date(2025, 8, 1, 0, 0)); // Sep 1, 2025, 00:00
      expect(result[0].validTo).toEqual(new Date(2025, 8, 15, 23, 59)); // Sep 15, 2025, 23:59
    });
  });

  describe('Special cases', () => {
    it('should handle permanent NOTAMs (no dates set)', () => {
      const html = `
        <div>N0000/25 LLHA E) PERMANENT CHANGE TO PROCEDURE PERM</div>
      `;

      const result = parseHtmlContent(html);

      expect(result).toHaveLength(1);
      expect(result[0].validFrom).toBeUndefined();
      expect(result[0].validTo).toBeUndefined();
    });

    it('should handle NOTAMs with PERMANENT keyword', () => {
      const html = `
        <div>A9876/25 LLBG E) PERMANENT RUNWAY MARKING CHANGE</div>
      `;

      const result = parseHtmlContent(html);

      expect(result).toHaveLength(1);
      expect(result[0].validFrom).toBeUndefined();
      expect(result[0].validTo).toBeUndefined();
    });

    it('should handle NOTAMs with no date information', () => {
      const html = `
        <div>C4567/25 LLLL E) GENERAL INFORMATION NOTICE</div>
      `;

      const result = parseHtmlContent(html);

      expect(result).toHaveLength(1);
      expect(result[0].validFrom).toBeUndefined();
      expect(result[0].validTo).toBeUndefined();
    });

    it('should handle case-insensitive date patterns', () => {
      const html = `
        <div>R1111/25 LLTB E) CASE TEST from 2501011200 to 2501011800</div>
      `;

      const result = parseHtmlContent(html);

      expect(result).toHaveLength(1);
      expect(result[0].validFrom).toEqual(new Date(2025, 0, 1, 12, 0));
      expect(result[0].validTo).toEqual(new Date(2025, 0, 1, 18, 0));
    });

    it('should prioritize first valid date pattern found', () => {
      const html = `
        <div>A2222/25 LLBG E) MULTIPLE DATES FROM 2501011200 TO 2501011800 ALSO VALID FROM 15 JAN 2025 08:00 TO 15 JAN 2025 20:00</div>
      `;

      const result = parseHtmlContent(html);

      expect(result).toHaveLength(1);
      // Should use the first pattern (standard NOTAM format)
      expect(result[0].validFrom).toEqual(new Date(2025, 0, 1, 12, 0));
      expect(result[0].validTo).toEqual(new Date(2025, 0, 1, 18, 0));
    });
  });
});
