// Accenture Dossier Generation Script
import fs from "fs";

if (fs.existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
} else if (fs.existsSync(".env")) {
  process.loadEnvFile(".env");
}

import { companyGraph } from "./src/graph/companyGraph.js";
import { ReportBuilder } from "./src/orchestration/reportBuilder.js";

async function main() {
  const company = "Accenture";
  console.log(`Generating dossier for ${company}...`);

  if (!process.env.OPENAI_API_KEY && !process.env.GEMINI_API_KEY) {
    console.error("Error: Please set your OPENAI_API_KEY or GEMINI_API_KEY in your .env.local file first.");
    process.exit(1);
  }

  const start = Date.now();
  const result = await companyGraph.invoke({
    companyName: company,
    dossierType: "company",
  });
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  const sections = result.reviewedSections || {};
  const sectionIds = Object.keys(sections).filter((k) => sections[k]?.trim());

  if (sectionIds.length === 0) {
    console.error("Failed to generate dossier. Errors:", result.errors);
    process.exit(1);
  }

  // Build the complete Markdown output
  const formatted = ReportBuilder.build(
    {
      companyName: company,
      reportType: "full",
      persona: "mba",
      outputFormat: "markdown",
    },
    sections,
    {
      overallConfidence: result.reportQuality || 9,
      sourcesUsed: ["Google Finance", "Yahoo Finance", "Wikipedia", "Google Search", "Glassdoor"],
    }
  );

  const outputPath = "./accenture-dossier.md";
  fs.writeFileSync(outputPath, formatted.content);

  console.log(`\nSuccess! Dossier generated in ${elapsed}s.`);
  console.log(`Saved markdown to: ${outputPath}`);
  console.log(`\nTo get the PDF:`);
  console.log(`1. Run your local server: npm run dev`);
  console.log(`2. Open http://localhost:3000 in your browser.`);
  console.log(`3. Search for "Accenture" to view the generated dossier.`);
  console.log(`4. Click the "Print" button on the top right, and select "Save as PDF" in your print dialog.`);
}

main().catch(console.error);
