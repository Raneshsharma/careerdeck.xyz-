import type { CompanyState } from "../state";

export async function normalizeCompanyNameNode(
  state: CompanyState,
): Promise<Partial<CompanyState>> {
  const name = state.companyName.trim();
  const normalized = name
    .replace(/\s+Inc\.?$/i, "")
    .replace(/\s+Corp\.?$/i, "")
    .replace(/\s+Ltd\.?$/i, "")
    .replace(/\s+LLC$/i, "")
    .replace(/\s+PLC$/i, "")
    .replace(/\s+L\.?L\.?C\.?$/i, "")
    .replace(/\s+Pvt\.?\s*Ltd\.?$/i, "")
    .trim();
  return {
    normalizedCompanyName: normalized,
    startedAt: new Date().toISOString(),
  };
}
