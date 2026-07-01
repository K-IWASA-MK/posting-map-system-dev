export enum OptimizationDecision {
  ACCEPT = "ACCEPT",
  REJECT = "REJECT",
  DEFER = "DEFER",
  REEVALUATE = "REEVALUATE"
}

export interface OptimizationVector {
  latencyScore: number;
  throughputScore: number;
  stabilityScore: number;
  resourceEfficiency: number;
  governanceAlignment: number;
  executionSmoothness: number;
}

export interface OptimizationCandidate {
  id: string;
  targetLayer: string;
  proposedChange: string;
  expectedGain: number;
  riskScore: number;
  dependencyImpact: string[];
}
