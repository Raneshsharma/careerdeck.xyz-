import type { CompanyState } from "../state";

/**
 * Placeholder conditional edge: route after validation.
 * Future logic: if invalid, route to END; if valid, continue to normalization.
 */
export function routeAfterValidation(state: CompanyState): string {
  if (!state.validation?.isValid) {
    return "__end__";
  }
  return "normalizeCompanyName";
}
