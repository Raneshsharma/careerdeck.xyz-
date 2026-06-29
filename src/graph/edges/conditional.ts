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

/**
 * Route after final report validation: if critical issues exist and attempts < 2, route to correctionPass.
 * Otherwise, finish and route to END (__end__).
 */
export function routeAfterFinalValidation(state: CompanyState): string {
  const issues = state.reportIssues ?? [];
  const critical = issues.filter((i) => i.severity === "critical");
  const attempts = state.validationAttempts ?? 0;

  if (critical.length > 0 && attempts < 2) {
    return "correctionPass";
  }

  return "__end__";
}
