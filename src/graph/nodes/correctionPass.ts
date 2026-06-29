import type { CompanyState } from "../state";
import { generateSection } from "../../prompts/llm";

const CORRECTION_SYSTEM_PROMPT = `You are a Senior Executive Editor.
Your job is to revise a specific section of a company dossier to resolve a critical quality issue identified by a report validator.

CRITICAL RULES:
1. Preserve all good content, formatting, and verified facts. Only modify the text necessary to resolve the issue.
2. Ensure you strictly adhere to the CORE FACTS. Do not contradict them.
3. If the validator flagged a contradiction (e.g. section says no brand, but core facts say strong brand), change the section to align with the core facts.
4. If the validator flagged an unsupported claim, remove or rewrite it to be supported by the core facts or general industry context.
5. If the validator flagged a negative hallucination for an unverified/unknown dimension, rewrite it to state that evidence is insufficient to conclude, rather than asserting a weakness.

Output ONLY the revised section in clean markdown.`;

export async function correctionPassNode(
  state: CompanyState,
): Promise<Partial<CompanyState>> {
  const issues = state.reportIssues ?? [];
  const critical = issues.filter((i) => i.severity === "critical");
  const attempts = state.validationAttempts ?? 0;

  if (critical.length === 0) {
    return { validationAttempts: attempts + 1 };
  }

  const reviewedSections = { ...(state.reviewedSections || {}) };
  const companyName = state.normalizedCompanyName || state.companyName;
  const cf = state.coreFacts;

  const coreFactsStr = cf ? JSON.stringify(cf, null, 2) : "No core facts available";

  for (const issue of critical) {
    const sectionId = issue.section;
    const currentContent = reviewedSections[sectionId];
    if (!currentContent?.trim()) continue;

    try {
      console.log(`[Correction Pass] Correcting section "${sectionId}" due to ${issue.category}...`);
      const userPrompt = `Revise the "${sectionId}" section for "${companyName}" to fix the following critical issue.

CRITICAL ISSUE IDENTIFIED:
Category: ${issue.category}
Detail: ${issue.detail}
Suggested Fix: ${issue.suggested_fix}

CORE FACTS (Authoritative Truths):
${coreFactsStr}

CURRENT SECTION CONTENT:
${currentContent}

Return ONLY the corrected section markdown.`;

      const corrected = await generateSection(CORRECTION_SYSTEM_PROMPT, userPrompt);
      if (corrected?.trim()) {
        reviewedSections[sectionId] = corrected.trim();
      }
    } catch (e) {
      console.error(`[Correction Pass] Failed to correct section "${sectionId}":`, e);
    }
  }

  // Clear report quality/issues so that finalValidator re-checks them
  return {
    reviewedSections,
    validationAttempts: attempts + 1,
    reportQuality: 0,
    reportIssues: [],
  };
}
