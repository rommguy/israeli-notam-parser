import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "fs";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === "production" ? "/israeli-notam-parser/" : "/",
  plugins: [
    react(),
    // Custom plugin to copy NOTAM data files
    {
      name: "copy-notam-data",
      buildStart() {
        // Ensure public/data directory exists
        const dataDir = resolve(__dirname, "public/data");
        if (!existsSync(dataDir)) {
          mkdirSync(dataDir, { recursive: true });
        }

        // Copy single notams.json file from parent directory
        const sourceDir = resolve(__dirname, "../daily-notams");
        const sourceFile = resolve(sourceDir, "notams.json");

        if (existsSync(sourceFile)) {
          const destFile = resolve(dataDir, "notams.json");
          copyFileSync(sourceFile, destFile);
          console.log("Copied notams.json to public/data/");

          // Create a simple manifest file
          const manifest = {
            dataFile: "notams.json",
            generatedAt: new Date().toISOString(),
            description:
              "Single NOTAM file with all data - filtering handled at runtime",
          };

          const manifestPath = resolve(dataDir, "manifest.json");
          writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
          console.log("Created data manifest for single file");
        } else {
          console.warn("notams.json file not found in daily-notams directory");
        }
      },
    },
  ],
});
