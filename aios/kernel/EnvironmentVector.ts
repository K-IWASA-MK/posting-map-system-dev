export enum AdaptationStrategy {
  SCALE_UP = "SCALE_UP",
  SCALE_DOWN = "SCALE_DOWN",
  REBALANCE_LAYERS = "REBALANCE_LAYERS",
  REWIRE_GRAPH = "REWIRE_GRAPH",
  OPTIMIZE_PATHS = "OPTIMIZE_PATHS",
  ISOLATE_MODULES = "ISOLATE_MODULES",
  MERGE_COMPONENTS = "MERGE_COMPONENTS"
}

export enum AdaptationDecision {
  APPLY = "APPLY",
  SIMULATE = "SIMULATE",
  DEFER = "DEFER",
  REJECT = "REJECT",
  PARTIAL_APPLY = "PARTIAL_APPLY"
}

export interface EnvironmentVector {
  loadDistribution: number;
  eventDensity: number;
  graphComplexityShift: number;
  governancePressure: number;
  executionLatencyTrend: number;
  systemEntropy: number;
}
