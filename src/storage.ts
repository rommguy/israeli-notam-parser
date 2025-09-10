import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { NOTAM } from './types';

/**
 * Interface for tracking incremental updates
 */
export interface NotamStorage {
  notams: NOTAM[];
  lastUpdated: Date;
  totalCount: number;
  newCount: number;
  metadata: {
    version: string;
    source: string;
  };
}

/**
 * Configuration for storage operations
 */
export interface StorageConfig {
  dataDirectory: string;
  backupDirectory?: string;
  maxBackups?: number;
}

const DEFAULT_CONFIG: StorageConfig = {
  dataDirectory: './data/notams',
  backupDirectory: './data/backups',
  maxBackups: 5
};

/**
 * Load existing NOTAMs from storage
 */
export async function loadExistingNotams(config: Partial<StorageConfig> = {}): Promise<NotamStorage> {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const storageFile = join(fullConfig.dataDirectory, 'notams.json');

  try {
    await ensureDirectoryExists(fullConfig.dataDirectory);
    const data = await fs.readFile(storageFile, 'utf-8');
    const parsed = JSON.parse(data) as NotamStorage;
    
    // Ensure all required fields are present
    return {
      notams: parsed.notams || [],
      lastUpdated: new Date(parsed.lastUpdated || new Date()),
      totalCount: parsed.totalCount || 0,
      newCount: 0, // Reset new count on load
      metadata: {
        ...parsed.metadata,
        version: parsed.metadata?.version || '1.0.0',
        source: parsed.metadata?.source || 'israeli-aviation-authority'
      }
    };
  } catch (error) {
    // If file doesn't exist or is invalid, return empty storage
    console.log('No existing NOTAM storage found, starting fresh');
    return {
      notams: [],
      lastUpdated: new Date(0), // Unix epoch to ensure all NOTAMs are considered new
      totalCount: 0,
      newCount: 0,
      metadata: {
        version: '1.0.0',
        source: 'israeli-aviation-authority'
      }
    };
  }
}

/**
 * Save NOTAMs to storage with backup
 */
export async function saveNotams(
  storage: NotamStorage, 
  config: Partial<StorageConfig> = {}
): Promise<void> {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const storageFile = join(fullConfig.dataDirectory, 'notams.json');

  try {
    // Ensure directories exist
    await ensureDirectoryExists(fullConfig.dataDirectory);
    if (fullConfig.backupDirectory) {
      await ensureDirectoryExists(fullConfig.backupDirectory);
    }

    // Create backup of existing file if it exists
    await createBackup(storageFile, fullConfig);

    // Update metadata
    const updatedStorage: NotamStorage = {
      ...storage,
      lastUpdated: new Date(),
      totalCount: storage.notams.length
    };

    // Write to storage
    await fs.writeFile(storageFile, JSON.stringify(updatedStorage, null, 2), 'utf-8');
    
    console.log(`Saved ${storage.notams.length} NOTAMs to storage (${storage.newCount} new)`);
  } catch (error) {
    throw new Error(`Failed to save NOTAMs to storage: ${error}`);
  }
}

/**
 * Merge new NOTAMs with existing ones, removing duplicates
 */
export function mergeNotams(existing: NOTAM[], newNotams: NOTAM[]): { merged: NOTAM[]; newCount: number } {
  const existingIds = new Set(existing.map(notam => notam.id));
  const uniqueNewNotams = newNotams.filter(notam => !existingIds.has(notam.id));
  
  // Combine existing and new NOTAMs
  const merged = [...existing, ...uniqueNewNotams];
  
  // Sort by creation date (newest first) and then by ID for consistency
  merged.sort((a, b) => {
    const dateCompare = new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
    return dateCompare !== 0 ? dateCompare : a.id.localeCompare(b.id);
  });

  return {
    merged,
    newCount: uniqueNewNotams.length
  };
}

/**
 * Get NOTAMs that need to be fetched (based on IDs not in existing storage)
 */
export function getNotamsToFetch(existingNotams: NOTAM[], scrapedNotamIds: string[]): string[] {
  const existingIds = new Set(existingNotams.map(notam => notam.id));
  return scrapedNotamIds.filter(id => !existingIds.has(id));
}

/**
 * Clean up old NOTAMs based on age or count limits
 */
export function cleanupOldNotams(
  notams: NOTAM[], 
  maxAge?: number, 
  maxCount?: number
): NOTAM[] {
  let filtered = [...notams];

  // Remove NOTAMs older than maxAge days
  if (maxAge) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAge);
    
    filtered = filtered.filter(notam => {
      // Keep NOTAMs that are still valid or were created recently
      const createdDate = new Date(notam.createdDate);
      const isRecentlyCreated = createdDate >= cutoffDate;
      const isStillValid = notam.validTo ? new Date(notam.validTo) >= new Date() : true;
      
      return isRecentlyCreated || isStillValid;
    });
  }

  // Limit total count (keep most recent)
  if (maxCount && filtered.length > maxCount) {
    // Sort by creation date (newest first) before limiting
    filtered.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
    filtered = filtered.slice(0, maxCount);
  }

  return filtered;
}

/**
 * Export NOTAMs in daily format (for backward compatibility)
 */
export async function exportDailyNotams(
  notams: NOTAM[], 
  date: string, 
  outputPath: string
): Promise<void> {
  const dailyData = {
    notams: notams,
    lastUpdated: new Date().toISOString(),
    totalCount: notams.length,
    date: date
  };

  await ensureDirectoryExists(dirname(outputPath));
  await fs.writeFile(outputPath, JSON.stringify(dailyData, null, 2), 'utf-8');
  console.log(`Exported ${notams.length} NOTAMs to ${outputPath}`);
}

/**
 * Create backup of existing storage file
 */
async function createBackup(storageFile: string, config: StorageConfig): Promise<void> {
  if (!config.backupDirectory) return;

  try {
    const exists = await fs.access(storageFile).then(() => true).catch(() => false);
    if (!exists) return;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = join(config.backupDirectory, `notams-backup-${timestamp}.json`);
    
    await fs.copyFile(storageFile, backupFile);
    
    // Clean up old backups
    if (config.maxBackups) {
      await cleanupOldBackups(config.backupDirectory, config.maxBackups);
    }
  } catch (error) {
    console.warn(`Failed to create backup: ${error}`);
  }
}

/**
 * Clean up old backup files
 */
async function cleanupOldBackups(backupDir: string, maxBackups: number): Promise<void> {
  try {
    const files = await fs.readdir(backupDir);
    const backupFiles = files
      .filter(file => file.startsWith('notams-backup-') && file.endsWith('.json'))
      .map(file => ({
        name: file,
        path: join(backupDir, file),
        time: file.match(/notams-backup-(.+)\.json$/)?.[1] || ''
      }))
      .sort((a, b) => b.time.localeCompare(a.time)); // Sort by timestamp, newest first

    // Remove old backups
    const filesToDelete = backupFiles.slice(maxBackups);
    for (const file of filesToDelete) {
      await fs.unlink(file.path);
    }

    if (filesToDelete.length > 0) {
      console.log(`Cleaned up ${filesToDelete.length} old backup files`);
    }
  } catch (error) {
    console.warn(`Failed to cleanup old backups: ${error}`);
  }
}

/**
 * Ensure directory exists, create if it doesn't
 */
async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

/**
 * Get storage statistics
 */
export function getStorageStats(storage: NotamStorage): {
  totalNotams: number;
  newNotams: number;
  lastUpdated: Date;
  oldestNotam?: Date;
  newestNotam?: Date;
} {
  const notams = storage.notams;
  const dates = notams
    .map(n => new Date(n.createdDate))
    .sort((a, b) => a.getTime() - b.getTime());

  return {
    totalNotams: storage.totalCount,
    newNotams: storage.newCount,
    lastUpdated: new Date(storage.lastUpdated),
    oldestNotam: dates.length > 0 ? dates[0] : undefined,
    newestNotam: dates.length > 0 ? dates[dates.length - 1] : undefined
  };
}
