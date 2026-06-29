// Quick end-to-end graph test
import { companyGraph } from "./src/graph/companyGraph.js";

async function main() {
  console.log("Testing company graph with Zomato...\n");

  const start = Date.now();
  const result = await companyGraph.invoke({
    companyName: "Zomato",
    dossierType: "company",
  });
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  const sections = result.reviewedSections || {};
  const sectionIds = Object.keys(sections).filter((k) => sections[k]?.trim());

  console.log(`Duration: ${elapsed}s`);
  console.log(`Sections generated: ${sectionIds.length}`);
  console.log(`Quality score: ${result.reportQuality ?? "N/A"}`);
  console.log(`Issues found: ${result.reportIssues?.length ?? 0}`);
  console.log(`Competitor intelligence: ${result.competitorIntelligence?.competitors?.length ?? 0} competitors researched`);
  console.log(`Errors: ${result.errors?.length ?? 0}`);

  if (sectionIds.length > 0) {
    console.log("\nSection summary:");
    for (const id of sectionIds) {
      const content = sections[id];
      const words = content.split(/\s+/).filter(Boolean).length;
      console.log(`  ${id}: ${words} words`);
    }
  }

  if (result.errors?.length > 0) {
    console.log("\nErrors:");
    for (const err of result.errors) {
      console.log(`  - ${err}`);
    }
  }

  console.log("\nDone.");
}

main().catch(console.error);
