import { z } from "zod";

export const companyFactSchema = z.object({
  facts: z.array(z.string()).describe("Concrete, verifiable facts about the company"),
});
