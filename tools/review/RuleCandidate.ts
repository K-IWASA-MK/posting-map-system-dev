export interface RuleProvenance {
  readonly derivedFromKnowledge: readonly string[]; // Original experience/knowledge IDs
  readonly derivedFromPatterns: readonly string[];  // Original pattern IDs
  readonly simulationRunId: string;                 // Validating Simulation run ID
  readonly consensusSessionId: string;             // Validating Consensus review ID
  readonly promotedAt: string;                      // ISO timestamp when promoted
}

export interface RuleCandidate {
  readonly id: string;
  readonly title: string;
  readonly category: 'Boundary' | 'Ownership' | 'Responsibility' | 'Dependency' | 'Security';
  readonly rationale: string;
  readonly triggerConditions: readonly string[];    // Match conditions (e.g. ["project-escape", "root-file:*.json"])
  readonly confidence: number;                      // Calculated evolution confidence level
  readonly status: 'CANDIDATE' | 'VALIDATED' | 'PROMOTED' | 'REJECTED';
  readonly provenance?: RuleProvenance;
  readonly createdAt: string;
}
