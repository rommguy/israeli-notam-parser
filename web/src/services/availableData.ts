/**
 * Service to detect available NOTAM data files using build-time manifest
 */

interface DataManifest {
  availableFiles: string[];
  generatedAt: string;
  mapping: {
    today: string | null;
    tomorrow: string | null;
  };
}

let cachedManifest: DataManifest | null = null;

/**
 * Load the data manifest created during build time
 */
export const getDataManifest = async (): Promise<DataManifest> => {
  if (cachedManifest) {
    return cachedManifest;
  }

  try {
    // Handle both local development and GitHub Pages paths
    const basePath = import.meta.env.BASE_URL || '/';
    const manifestUrl = basePath.endsWith('/') ? `${basePath}data/manifest.json` : `${basePath}/data/manifest.json`;
    
    const response = await fetch(manifestUrl);
    if (!response.ok) {
      throw new Error('Manifest not found');
    }
    
    cachedManifest = await response.json();
    return cachedManifest!;
  } catch (error) {
    console.warn('Could not load data manifest, using fallback');
    // Fallback manifest for development or if manifest is missing
    return {
      availableFiles: [],
      generatedAt: new Date().toISOString(),
      mapping: {
        today: null,
        tomorrow: null
      }
    };
  }
};

/**
 * Get the actual file path for a date selection based on available data
 */
export const getActualDataPath = async (dateSelection: 'today' | 'tomorrow'): Promise<string> => {
  const manifest = await getDataManifest();
  
  const fileName = manifest.mapping[dateSelection];
  
  if (!fileName) {
    throw new Error(`No NOTAM data available for ${dateSelection}. Available files: ${manifest.availableFiles.join(', ')}`);
  }
  
  // Handle both local development and GitHub Pages paths
  const basePath = import.meta.env.BASE_URL || '/';
  return basePath.endsWith('/') ? `${basePath}data/${fileName}` : `${basePath}/data/${fileName}`;
};

/**
 * Get list of available NOTAM data files
 */
export const getAvailableDataFiles = async (): Promise<string[]> => {
  const manifest = await getDataManifest();
  return manifest.availableFiles;
};
