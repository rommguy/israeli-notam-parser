import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'fs'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/israeli-notam-parser/' : '/',
  plugins: [
    react(),
    // Custom plugin to copy NOTAM data files
    {
      name: 'copy-notam-data',
      buildStart() {
        // Ensure public/data directory exists
        const dataDir = resolve(__dirname, 'public/data')
        if (!existsSync(dataDir)) {
          mkdirSync(dataDir, { recursive: true })
        }

        // Copy all JSON files from parent directory
        const sourceDir = resolve(__dirname, '../daily-notams')
        
        if (existsSync(sourceDir)) {
          const files = readdirSync(sourceDir).filter(file => file.endsWith('.json'))
          
          files.forEach(file => {
            const sourcePath = resolve(sourceDir, file)
            const destPath = resolve(dataDir, file)
            
            copyFileSync(sourcePath, destPath)
            console.log(`Copied ${file} to public/data/`)
          })
          
          // Create a manifest file with available data files
          const manifest = {
            availableFiles: files.sort(),
            generatedAt: new Date().toISOString(),
            mapping: {
              today: files.sort()[0] || null,
              tomorrow: files.sort()[1] || files.sort()[0] || null
            }
          }
          
          const manifestPath = resolve(dataDir, 'manifest.json')
          writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
          console.log('Created data manifest with available files:', files)
          
          if (files.length === 0) {
            console.warn('No JSON files found in daily-notams directory')
          }
        } else {
          console.warn('daily-notams directory not found')
        }
      }
    }
  ],
})
