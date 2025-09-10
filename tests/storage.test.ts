import { promises as fs } from 'fs';
import { join } from 'path';
import { 
  loadExistingNotams, 
  saveNotams, 
  mergeNotams, 
  getStorageStats,
  cleanupOldNotams 
} from '../src/storage';
import { NOTAM } from '../src/types';

// Test data directory
const testDataDir = './test-data';
const testConfig = {
  dataDirectory: testDataDir,
  backupDirectory: join(testDataDir, 'backups')
};

// Sample NOTAM data for testing
const sampleNotam1: NOTAM = {
  id: 'A1234/25',
  icaoCode: 'LLBG',
  type: 'A',
  number: '1234',
  year: '25',
  description: 'Test NOTAM 1',
  createdDate: new Date('2025-01-01T12:00:00Z'),
  rawText: 'A1234/25 LLBG E) Test NOTAM 1',
  isExpanded: false
};

const sampleNotam2: NOTAM = {
  id: 'C5678/25',
  icaoCode: 'LLLL',
  type: 'C',
  number: '5678',
  year: '25',
  description: 'Test NOTAM 2',
  createdDate: new Date('2025-01-02T12:00:00Z'),
  rawText: 'C5678/25 LLLL E) Test NOTAM 2',
  isExpanded: true,
  expandedContent: 'Expanded content for test NOTAM 2'
};

describe('Storage System', () => {
  beforeEach(async () => {
    // Clean up test directory before each test
    try {
      await fs.rm(testDataDir, { recursive: true, force: true });
    } catch (error) {
      // Directory might not exist, which is fine
    }
  });

  afterEach(async () => {
    // Clean up test directory after each test
    try {
      await fs.rm(testDataDir, { recursive: true, force: true });
    } catch (error) {
      // Directory might not exist, which is fine
    }
  });

  describe('loadExistingNotams', () => {
    it('should return empty storage when no file exists', async () => {
      const storage = await loadExistingNotams(testConfig);
      
      expect(storage.notams).toEqual([]);
      expect(storage.totalCount).toBe(0);
      expect(storage.newCount).toBe(0);
      expect(storage.metadata.version).toBe('1.0.0');
      expect(storage.metadata.source).toBe('israeli-aviation-authority');
    });

    it('should load existing storage file', async () => {
      // Create test storage file
      const testStorage = {
        notams: [sampleNotam1],
        lastUpdated: new Date('2025-01-01T12:00:00Z'),
        totalCount: 1,
        newCount: 0,
        metadata: {
          version: '1.0.0',
          source: 'israeli-aviation-authority'
        }
      };

      await fs.mkdir(testDataDir, { recursive: true });
      await fs.writeFile(
        join(testDataDir, 'notams.json'),
        JSON.stringify(testStorage, null, 2)
      );

      const storage = await loadExistingNotams(testConfig);
      
      expect(storage.notams).toHaveLength(1);
      expect(storage.notams[0].id).toBe('A1234/25');
      expect(storage.totalCount).toBe(1);
    });
  });

  describe('saveNotams', () => {
    it('should save NOTAMs to storage file', async () => {
      const storage = {
        notams: [sampleNotam1, sampleNotam2],
        lastUpdated: new Date(),
        totalCount: 2,
        newCount: 2,
        metadata: {
          version: '1.0.0',
          source: 'israeli-aviation-authority'
        }
      };

      await saveNotams(storage, testConfig);

      // Verify file was created
      const storageFile = join(testDataDir, 'notams.json');
      const exists = await fs.access(storageFile).then(() => true).catch(() => false);
      expect(exists).toBe(true);

      // Verify content
      const savedContent = await fs.readFile(storageFile, 'utf-8');
      const savedStorage = JSON.parse(savedContent);
      
      expect(savedStorage.notams).toHaveLength(2);
      expect(savedStorage.totalCount).toBe(2);
    });
  });

  describe('mergeNotams', () => {
    it('should merge new NOTAMs with existing ones', () => {
      const existing = [sampleNotam1];
      const newNotams = [sampleNotam2];

      const { merged, newCount } = mergeNotams(existing, newNotams);

      expect(merged).toHaveLength(2);
      expect(newCount).toBe(1);
      expect(merged.map(n => n.id)).toEqual(['C5678/25', 'A1234/25']); // Sorted by date desc
    });

    it('should not duplicate existing NOTAMs', () => {
      const existing = [sampleNotam1];
      const newNotams = [sampleNotam1, sampleNotam2]; // sampleNotam1 is duplicate

      const { merged, newCount } = mergeNotams(existing, newNotams);

      expect(merged).toHaveLength(2);
      expect(newCount).toBe(1); // Only sampleNotam2 is new
      expect(merged.map(n => n.id)).toEqual(['C5678/25', 'A1234/25']);
    });
  });

  describe('getStorageStats', () => {
    it('should calculate storage statistics correctly', () => {
      const storage = {
        notams: [sampleNotam1, sampleNotam2],
        lastUpdated: new Date('2025-01-03T12:00:00Z'),
        totalCount: 2,
        newCount: 1,
        metadata: {
          version: '1.0.0',
          source: 'israeli-aviation-authority'
        }
      };

      const stats = getStorageStats(storage);

      expect(stats.totalNotams).toBe(2);
      expect(stats.newNotams).toBe(1);
      expect(stats.oldestNotam).toEqual(new Date('2025-01-01T12:00:00Z'));
      expect(stats.newestNotam).toEqual(new Date('2025-01-02T12:00:00Z'));
    });
  });

  describe('cleanupOldNotams', () => {
    it('should limit NOTAMs by count', () => {
      const notams = [sampleNotam1, sampleNotam2];
      const cleaned = cleanupOldNotams(notams, undefined, 1);

      expect(cleaned).toHaveLength(1);
      expect(cleaned[0].id).toBe('C5678/25'); // Most recent by creation date
    });

    it('should remove old NOTAMs by age', () => {
      const oldNotam: NOTAM = {
        ...sampleNotam1,
        createdDate: new Date('2020-01-01T12:00:00Z'), // Very old
        validTo: new Date('2020-01-02T12:00:00Z') // Expired
      };

      const notams = [oldNotam, sampleNotam2];
      const cleaned = cleanupOldNotams(notams, 30); // Keep only last 30 days

      expect(cleaned).toHaveLength(1);
      expect(cleaned[0].id).toBe('C5678/25'); // Recent one kept
    });
  });
});
