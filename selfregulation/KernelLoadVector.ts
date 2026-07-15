export enum RegulationAction {
  THROTTLE = "THROTTLE",
  PRIORITIZE = "PRIORITIZE",
  DEFER = "DEFER",
  REBALANCE = "REBALANCE",
  COMPRESS = "COMPRESS"
}

export enum KernelStateProfile {
  STABLE = "STABLE",
  OVERLOADED = "OVERLOADED",
  UNDERUTILIZED = "UNDERUTILIZED",
  OSCILLATING = "OSCILLATING",
  CRITICAL = "CRITICAL"
}

export interface KernelLoadVector {
  cpuPressure: number;
  eventPressure: number;
  executionQueueDepth: number;
  graphComplexity: number;
  governanceLatency: number;
}
