const fs = require("fs");
const path = require("path");

const targetNodeModules = path.resolve(__dirname, "../.next/standalone/node_modules");

if (fs.existsSync(targetNodeModules)) {
  console.log("Postbuild: Copying pdf-parse & pdfjs-dist assets to standalone node_modules...");
  
  const sources = ["pdf-parse", "pdfjs-dist"];
  sources.forEach(src => {
    const srcDir = path.resolve(__dirname, "../node_modules", src);
    const destDir = path.resolve(targetNodeModules, src);
    
    if (fs.existsSync(srcDir)) {
      try {
        fs.mkdirSync(destDir, { recursive: true });
        fs.cpSync(srcDir, destDir, { recursive: true });
        console.log(`Copied ${src} successfully.`);
      } catch (err) {
        console.error(`Failed to copy ${src}:`, err.message);
      }
    } else {
      console.warn(`Source ${srcDir} not found.`);
    }
  });
} else {
  console.log("Postbuild: Standalone node_modules not found, skipping asset copy.");
}
