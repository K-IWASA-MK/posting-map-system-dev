export enum StabilityState {
  STABLE = "STABLE",
  OSCILLATING = "OSCILLATING",
  DIVERGING = "DIVERGING",
  CONVERGING = "CONVERGING",
  DEGRADED = "DEGRADED",
  CRITICAL = "CRITICAL"
}

export interface FeedbackSignal {
  signalId: string;
  sourceLayer: string;
  magnitude: number;
  direction: string;
  timestamp: string;
  correlationId: string;
}

export interface StabilityVector {
  kernelLoad: number;
  eventDensity: number;
  graphVolatility: number;
  executionDrift: number;
  governancePressure: number;
}
