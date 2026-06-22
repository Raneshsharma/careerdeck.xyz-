import { ChatOpenAI } from "@langchain/openai";
import { companyFactSchema } from "./extract-schemas";

const extractor = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-3.5-turbo",
  temperature: 0,
});

export async function extractCompanyFacts(text) {
  if (!text?.trim()) return { facts: [] };

  const structured = extractor.withStructuredOutput(companyFactSchema, {
    method: "jsonMode",
    name: "extract_company_facts",
  });

  try {
    return await structured.invoke([
      {
        role: "system",
        content:
          "Extract concrete, verifiable facts about the company from the provided text. Each fact should be a short, self-contained phrase. Include all numbers, dates, names, and specific claims. Output ONLY valid JSON matching the schema.",
      },
      { role: "user", content: text },
    ]);
  } catch (e) {
    console.error("Structured extraction failed:", e.message);
    return { facts: [] };
  }
}
