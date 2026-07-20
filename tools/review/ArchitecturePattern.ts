export interface PatternProvenance {
  readonly createdAt: string;
  readonly validatedAt?: string;
  readonly lastUpdatedAt: string;
}

export interface PatternRecommendation {
  readonly action: string; // Recommended corrective action description
  readonly referenceKnowledgeId?: string; // Optional ID of reference knowledge
  readonly docLink?: string; // Reference documentation/ADR link
}

export interface ArchitecturePattern {
  readonly id: string;
  readonly name: string;
  readonly category: 'Boundary' | 'Ownership' | 'Responsibility' | 'Dependency' | 'Security';
  readonly description: string;
  readonly triggerConditions: readonly string[]; // Matchers e.g. ["project-escape", "root-file:*.json", "path-starts:..."]
  readonly recommendations: readonly PatternRecommendation[];
  
  // Stability & Lifecycle
  readonly stability: 'EXPERIMENTAL' | 'CANDIDATE' | 'ACTIVE' | 'DEPRECATED';
  readonly derivedFrom: readonly string[]; // Original ArchitectureKnowledge IDs
  readonly provenance: PatternProvenance;
  readonly confidence: number; // Evaluated matching confidence level (0.0 - 1.0)
}
