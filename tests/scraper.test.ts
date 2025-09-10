import { parseHtmlContent } from '../src/scraper';
import { NOTAM } from '../src/types';

describe('parseHtmlContent', () => {
  it('should parse NOTAM from HTML div element', () => {
    const html = `
      <html>
        <body>
          <div>
            A1234/25 LLBG E) RUNWAY 12/30 CLOSED DUE TO MAINTENANCE FROM 2501011200 TO 2501011800 
          </div>
        </body>
      </html>
    `;

    const result = parseHtmlContent(html);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'A1234/25',
      icaoCode: 'LLBG',
      type: 'A',
      number: '1234',
      year: '25',
      description: 'RUNWAY 12/30 CLOSED DUE TO MAINTENANCE FROM 2501011200 TO 2501011800'
    });
    expect(result[0].validFrom).toEqual(new Date(2025, 0, 1, 12, 0)); // Jan 1, 2025, 12:00
    expect(result[0].validTo).toEqual(new Date(2025, 0, 1, 18, 0)); // Jan 1, 2025, 18:00
  });

  it('should parse NOTAM from HTML td element', () => {
    const html = `
      <html>
        <body>
          <table>
            <tr>
              <td>
                C0567/25 LLLL E) NAVIGATION AID VOR/DME OUT OF SERVICE VALID FROM 15 JAN 2025 08:00 TO 15 JAN 2025 20:00
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const result = parseHtmlContent(html);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'C0567/25',
      icaoCode: 'LLLL',
      type: 'C',
      number: '0567',
      year: '25',
      description: 'NAVIGATION AID VOR/DME OUT OF SERVICE VALID FROM 15 JAN 2025 08:00 TO 15 JAN 2025 20:00'
    });
    expect(result[0].validFrom).toEqual(new Date(2025, 0, 15, 8, 0)); // Jan 15, 2025, 08:00
    expect(result[0].validTo).toEqual(new Date(2025, 0, 15, 20, 0)); // Jan 15, 2025, 20:00
  });

  it('should parse multiple NOTAMs from HTML', () => {
    const html = `
      <html>
        <body>
          <div>A1111/25 LLBG E) FIRST NOTAM FROM 2501010600 TO 2501010800</div>
          <td>R2222/25 LLLL E) SECOND NOTAM WEF 02 JAN 2025</td>
          <div>N3333/25 LLTB E) THIRD NOTAM TILL 03 JAN 2025 23:59</div>
        </body>
      </html>
    `;

    const result = parseHtmlContent(html);

    expect(result).toHaveLength(3);
    expect(result.map(n => n.id)).toEqual(['A1111/25', 'N3333/25', 'R2222/25']);
    expect(result.map(n => n.icaoCode)).toEqual(['LLBG', 'LLTB', 'LLLL']);
    expect(result.map(n => n.type)).toEqual(['A', 'N', 'R']);
  });

  it('should handle HTML with no NOTAMs', () => {
    const html = `
      <html>
        <body>
          <div>Some random text without NOTAM format</div>
          <td>Another cell with no NOTAM data</td>
        </body>
      </html>
    `;

    const result = parseHtmlContent(html);

    expect(result).toHaveLength(0);
  });

  it('should remove duplicate NOTAMs based on ID', () => {
    const html = `
      <html>
        <body>
          <div>A1234/25 LLBG E) DUPLICATE NOTAM FROM 2501011200 TO 2501011800</div>
          <td>A1234/25 LLBG E) SAME NOTAM AGAIN FROM 2501011200 TO 2501011800</td>
        </body>
      </html>
    `;

    const result = parseHtmlContent(html);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('A1234/25');
  });

  it('should handle malformed HTML gracefully', () => {
    const html = `
      <html>
        <body>
          <div>A1234/25 LLBG E) VALID NOTAM FROM 2501011200 TO 2501011800
          <td>C5678/25 LLLL E) ANOTHER NOTAM
        </body>
    `;

    const result = parseHtmlContent(html);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('A1234/25');
    expect(result[1].id).toBe('C5678/25');
  });

  it('should clean text properly and extract map links', () => {
    const html = `
      <html>
        <body>
          <div>
            A1234/25 LLBG E) OBSTACLE LIGHT UNSERVICEABLE AT PSN 320024N0344404E
            FROM 2501011200 TO 2501011800
          </div>
        </body>
      </html>
    `;

    const result = parseHtmlContent(html);

    expect(result).toHaveLength(1);
    expect(result[0].mapLink).toContain('google.com/maps');
    expect(result[0].mapLink).toContain('32°00\'24"N+034°44\'04"E');
    expect(result[0].rawText).not.toContain('\n');
    expect(result[0].rawText).toContain('PSN 320024N0344404E');
  });

  it('should handle lowercase NOTAM types and convert to uppercase', () => {
    const html = `
      <html>
        <body>
          <div>a1234/25 LLBG E) LOWERCASE TYPE FROM 2501011200 TO 2501011800</div>
          <td>c5678/25 LLLL E) ANOTHER LOWERCASE</td>
        </body>
      </html>
    `;

    const result = parseHtmlContent(html);

    expect(result).toHaveLength(2);
    expect(result[0].type).toBe('A');
    expect(result[0].id).toBe('A1234/25');
    expect(result[1].type).toBe('C');
    expect(result[1].id).toBe('C5678/25');
  });
});
