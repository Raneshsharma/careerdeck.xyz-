export interface ValidationResult {
  valid: boolean;
  issues: string[];
}

/**
 * Deterministic validator (no LLM). Checks for structural problems.
 */
export function validateSection(section: string, sectionName: string): ValidationResult {
  const issues: string[] = [];

  if (!section || section.trim().length === 0) {
    return { valid: false, issues: ["Section is empty"] };
  }

  // Check for placeholder text
  const placeholderPatterns = [
    /\[TODO\]/i,
    /\[TBD\]/i,
    /\[INSERT\]/i,
    /\[PLACEHOLDER\]/i,
    /\[CONTENT\]/i,
    /lorem ipsum/i,
    /TODO:/i,
    /FIXME:/i,
  ];

  for (const p of placeholderPatterns) {
    if (p.test(section)) {
      issues.push(`Contains placeholder text matching: ${p.source}`);
    }
  }

  // Check for empty section markers
  if (section.trim().length < 50) {
    issues.push("Section is too short (under 50 chars) — likely empty or incomplete");
  }

  // Check for duplicate paragraphs
  const paragraphs = section.split(/\n\n+/).filter((p) => p.trim().length > 0);
  const seen = new Set<string>();
  for (const para of paragraphs) {
    const normalized = para.trim().toLowerCase().slice(0, 100);
    if (seen.has(normalized)) {
      issues.push("Contains duplicate or near-duplicate paragraphs");
      break;
    }
    seen.add(normalized);
  }

  // Check markdown structure: should start with ## header
  if (!/^##\s+\d+\./.test(section.trim())) {
    issues.push("Section does not start with a '## N.' header");
  }

  // Check for bare JSON objects (editor failure)
  if (section.trim().startsWith("{") && section.trim().includes('"revised_section"')) {
    issues.push("Section appears to be raw JSON — editor may have failed to parse output");
  }

  // Check for obvious truncation
  if (/[.!?]\s*$/.test(section.trim()) === false && section.trim().length > 200) {
    // Section doesn't end with proper punctuation
    // Mild issue only if very long
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
