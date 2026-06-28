import { z } from "zod";

/**
 * Placeholder Zod schema for structured company data.
 * Future sections can extend this schema as the graph grows.
 */
export const CompanySchema = z.object({
  name: z.string(),
  normalizedName: z.string().optional(),
  ticker: z.string().optional(),
  industry: z.string().optional(),
  founded: z.string().optional(),
  headquarters: z.string().optional(),
  employees: z.string().optional(),
  revenue: z.string().optional(),
  description: z.string().optional(),
  mission: z.string().optional(),
  products: z.array(z.string()).optional(),
  competitors: z.array(z.string()).optional(),
});

export type Company = z.infer<typeof CompanySchema>;
