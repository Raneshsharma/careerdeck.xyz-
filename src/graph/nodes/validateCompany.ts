import type { CompanyState } from "../state";

/**
 * Placeholder node: validates the incoming company request.
 * Future logic: check required fields, length limits, blocklist, etc.
 */
export async function validateCompanyNode(
  state: CompanyState,
): Promise<Partial<CompanyState>> {
  // TODO: implement validation rules
  return {
    validation: {
      isValid: state.companyName.trim().length > 0,
      errors: [],
    },
  };
}
