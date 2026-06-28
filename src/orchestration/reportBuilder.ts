import type {
  Persona,
  ReportType,
  OutputFormat,
  OrchestrationRequest,
  FormattedOutput,
} from "./types";
import { REPORT_SECTIONS, SECTION_MAP, PERSONA_INTROS } from "./types";
import type { ReportExplainability } from "./types";

/**
 * Dynamic Report Builder — assembles reports based on
 * report type, persona, and requested sections.
 */
export class ReportBuilder {
  static build(
    request: OrchestrationRequest,
    reviewedSections: Record<string, string>,
    explainability: ReportExplainability,
  ): FormattedOutput {
    const sections = this.selectSections(request);
    const intro = this.personaIntro(request.persona);

    switch (request.outputFormat) {
      case "json":
        return this.buildJson(request, reviewedSections, explainability);
      case "structured":
        return this.buildStructured(reviewedSections);
      case "markdown":
      default:
        return this.buildMarkdown(sections, reviewedSections, intro);
    }
  }

  static selectSections(request: OrchestrationRequest): string[] {
    if (request.sections?.length) return request.sections;
    return REPORT_SECTIONS[request.reportType] ?? REPORT_SECTIONS.full;
  }

  static personaIntro(persona: Persona): string {
    return PERSONA_INTROS[persona] ?? PERSONA_INTROS.mba;
  }

  private static buildMarkdown(
    sectionIds: string[],
    reviewed: Record<string, string>,
    intro: string,
  ): FormattedOutput {
    const parts: string[] = [intro];

    for (const id of sectionIds) {
      const content = reviewed[id];
      if (content?.trim()) {
        parts.push(content);
      }
    }

    return {
      format: "markdown",
      content: parts.join("\n\n"),
    };
  }

  private static buildJson(
    request: OrchestrationRequest,
    reviewed: Record<string, string>,
    explainability: ReportExplainability,
  ): FormattedOutput {
    return {
      format: "json",
      content: {
        metadata: {
          companyName: request.companyName,
          reportType: request.reportType,
          persona: request.persona,
          generatedAt: new Date().toISOString(),
          overallConfidence: explainability.overallConfidence,
          sourcesUsed: explainability.sourcesUsed,
        },
        sections: reviewed,
        explainability,
      },
    };
  }

  private static buildStructured(
    reviewed: Record<string, string>,
  ): FormattedOutput {
    return {
      format: "structured",
      content: reviewed,
    };
  }

  static getSectionTitle(sectionId: string): string {
    return SECTION_MAP[sectionId] ?? sectionId;
  }
}
