export interface EvolutionPolicy {
  minConfidence: number;
  requireSimulation: boolean;
  autoApproveThreshold: number;
}

export interface SimulationPolicy {
  maxDurationMs: number;
  strictCompatibilityCheck: boolean;
}

export interface ApprovalPolicy {
  requireManualReviewBelowScore: number;
  rejectBelowScore: number;
}

export interface StrategyPolicy {
  allowedStrategies: string[];
  defaultStrategy: string;
}
