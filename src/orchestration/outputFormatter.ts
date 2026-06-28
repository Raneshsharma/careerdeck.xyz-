import type { OutputFormat, FormattedOutput } from "./types";
import { PERSONA_INTROS } from "./types";
import type { ReportExplainability } from "./types";
import type { Persona } from "./types";

/**
 * Output Formatter — converts sections into
 * Markdown, JSON, or structured API responses.
 */
export class OutputFormatter {
  static format(
    format: OutputFormat,
    sections: Record<string, string>,
    options: {
      companyName?: string;
      persona?: Persona;
      explainability?: ReportExplainability;
    } = {},
  ): FormattedOutput {
    switch (format) {
      case "json":
        return this.toJson(sections, options);
      case "structured":
        return this.toStructured(sections);
      case "markdown":
      default:
        return this.toMarkdown(sections, options.persona ?? "mba");
    }
  }

  private static toMarkdown(
    sections: Record<string, string>,
    persona: Persona,
  ): FormattedOutput {
    const intro = PERSONA_INTROS[persona] ?? PERSONA_INTROS.mba;
    const content = Object.values(sections)
      .filter((s) => s?.trim())
      .join("\n\n");

    return {
      format: "markdown",
      content: `${intro}${content}`,
    };
  }

  private static toJson(
    sections: Record<string, string>,
    options: {
      companyName?: string;
      explainability?: ReportExplainability;
    },
  ): FormattedOutput {
    const output: Record<string, unknown> = {
      companyName: options.companyName,
      generatedAt: new Date().toISOString(),
      sections,
    };

    if (options.explainability) {
      output.explainability = {
        overallConfidence: options.explainability.overallConfidence,
        sourcesUsed: options.explainability.sourcesUsed,
      };
    }

    return { format: "json", content: output };
  }

  private static toStructured(
    sections: Record<string, string>,
  ): FormattedOutput {
    return { format: "structured", content: sections };
  }

  /**
   * Future: convert to PDF, Word, HTML, etc.
   */
  static async toPDF(_sections: Record<string, string>): Promise<Buffer> {
    throw new Error("PDF export not yet implemented — plug in a PDF generator");
  }
}
