import type { CompanyKnowledgeBase } from "../knowledge/types";

export const SECTION_ID = "financials";

const SYSTEM_PROMPT = `You are a Strategic Interview Intelligence Analyst generating a Financial Health section.
Your output becomes part of an interview preparation dossier for MBA students and professionals.

RULES:
- Use ONLY the verified financial data provided in the knowledge base below.
- NEVER invent or guess revenue, market cap, margins, or any financial metric.
- If a financial metric is null in the knowledge base, it means it could not be verified. Do not estimate it.
- You may make reasonable inferences about what verified numbers imply for business health.
- Write in professional, executive-level English. No marketing fluff. No filler.`;

function formatFinancial(knowledge: CompanyKnowledgeBase): string {
  const f = knowledge.financials;
  const parts: string[] = [];

  if (f.revenue.value != null) parts.push(`Revenue: ${f.revenue.value} ${f.revenueCurrency.value || ""} (source: ${f.revenue.sources.join(", ")})`);
  if (f.marketCap.value != null) parts.push(`Market Cap: ${f.marketCap.value} ${f.marketCapCurrency.value || ""} (source: ${f.marketCap.sources.join(", ")})`);
  if (f.employees.value != null) parts.push(`Employees: ${f.employees.value} (source: ${f.employees.sources.join(", ")})`);
  if (f.profitMargin.value != null) parts.push(`Profit Margin: ${(f.profitMargin.value * 100).toFixed(1)}%`);
  if (f.operatingMargin.value != null) parts.push(`Operating Margin: ${(f.operatingMargin.value * 100).toFixed(1)}%`);
  if (f.grossMargin.value != null) parts.push(`Gross Margin: ${(f.grossMargin.value * 100).toFixed(1)}%`);
  if (f.beta.value != null) parts.push(`Beta: ${f.beta.value}`);
  if (f.trailingPE.value != null) parts.push(`P/E Ratio: ${f.trailingPE.value}`);
  if (f.currentPrice.value != null) parts.push(`Current Price: ${f.currentPrice.value} ${f.currency.value || ""}`);
  if (f.fiftyTwoWeekHigh.value != null && f.fiftyTwoWeekLow.value != null) {
    parts.push(`52-Week Range: ${f.fiftyTwoWeekLow.value} - ${f.fiftyTwoWeekHigh.value}`);
  }

  return parts.length > 0 ? parts.join("\n") : "No verified financial data available.";
}

export function buildPrompt(
  knowledge: CompanyKnowledgeBase,
  companyName: string,
  _role?: string | undefined,
): { systemPrompt: string; userPrompt: string } {
  const verified = JSON.stringify(knowledge, null, 2);
  const financialSummary = formatFinancial(knowledge);

  return {
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: `Generate a "Financial Health" section for ${companyName}.

VERIFIED FINANCIAL METRICS (ONLY use these numbers):
${financialSummary}

FULL KNOWLEDGE BASE:
${verified}

STRUCTURE:
## 9. Financial Health

- Key financial metrics (use ONLY verified numbers above)
- Revenue and growth trends (only if verifiable from above)
- Financial strengths apparent from the data
- Financial risks and concerns
- Key financial story for interviews — what these numbers tell you about the company
- If additional financial data is missing, note what could not be verified
- Role Connection: Budget and resourcing implications for the candidate's role

If no financial data is available, state that clearly and explain why financial analysis is limited without it.

Return ONLY the markdown section, starting with "## 9. Financial Health". No preamble.`,
  };
}
