export interface PromptMeta {
  promptId: string;
  version: string;
  created: string;
  sectionId: string;
  sectionName: string;
  modelCompatibility: string[];
  expectedInputs: string[];
  expectedOutputs: string[];
  description?: string;
}

interface PromptEntry {
  meta: PromptMeta;
  buildPrompt: (
    knowledge: Record<string, unknown>,
    companyName: string,
    role?: string,
  ) => { systemPrompt: string; userPrompt: string };
}

/**
 * Prompt Registry — versioned prompt management.
 *
 * Instead of editing prompts inline, register versions here.
 * The registry enables A/B testing, regression testing,
 * and "which version generated better results?" queries.
 */
export class PromptRegistry {
  private static prompts = new Map<string, PromptEntry[]>();

  static register(
    promptId: string,
    version: string,
    meta: Omit<PromptMeta, "version" | "promptId">,
    buildPrompt: PromptEntry["buildPrompt"],
  ): void {
    const entry: PromptEntry = {
      meta: { promptId, version, ...meta },
      buildPrompt,
    };

    const existing = this.prompts.get(promptId) ?? [];
    existing.push(entry);
    this.prompts.set(promptId, existing);
  }

  static getLatest(promptId: string): PromptEntry | null {
    const versions = this.prompts.get(promptId);
    if (!versions || versions.length === 0) return null;
    return versions[versions.length - 1];
  }

  static getVersion(promptId: string, version: string): PromptEntry | null {
    const versions = this.prompts.get(promptId);
    return versions?.find((v) => v.meta.version === version) ?? null;
  }

  static getAllVersions(promptId: string): PromptEntry[] {
    return this.prompts.get(promptId) ?? [];
  }

  static listAll(): PromptMeta[] {
    const result: PromptMeta[] = [];
    for (const versions of this.prompts.values()) {
      for (const v of versions) {
        result.push(v.meta);
      }
    }
    return result.sort((a, b) => a.sectionId.localeCompare(b.sectionId));
  }

  static getPromptsForComparison(
    sectionId: string,
    versionA: string,
    versionB: string,
  ): PromptEntry[] {
    const entries = this.prompts.get(sectionId) ?? [];
    return entries.filter(
      (e) => e.meta.version === versionA || e.meta.version === versionB,
    );
  }

  static clear(): void {
    this.prompts.clear();
  }
}
