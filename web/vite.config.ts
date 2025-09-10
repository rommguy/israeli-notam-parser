import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, existsSync, mkdirSync } from 'fs'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
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

        // Copy JSON files from parent directory
        const sourceDir = resolve(__dirname, '../daily-notams')
        const files = ['2025-09-10.json', '2025-09-11.json']
        
        files.forEach(file => {
          const sourcePath = resolve(sourceDir, file)
          const destPath = resolve(dataDir, file)
          
          if (existsSync(sourcePath)) {
            copyFileSync(sourcePath, destPath)
            console.log(`Copied ${file} to public/data/`)
          }
        })
      }
    }
  ],
})
