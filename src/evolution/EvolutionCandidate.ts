export interface EvolutionCandidate {
  id: string;
  targetLayer: string;
  proposedChange: string;
  impactScope: string[];
  riskScore: number;
  dependencyGraphRef: string;
}
