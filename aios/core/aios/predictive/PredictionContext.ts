export interface PredictionContext {
  readonly traceId: string;
  readonly executionId: string;
  readonly routingId: string;
  readonly optimizationId: string;
  readonly historyWindow: number;
  readonly dataQuality: number;
  readonly sampleSize: number;
  readonly confidenceBaseline: number;
  readonly environmentVector: import("../optimization/EnvironmentVector").EnvironmentVector;
}
