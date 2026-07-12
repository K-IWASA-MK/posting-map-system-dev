export interface ObservabilityConfiguration {
  readonly maxTelemetryCapacity?: number;
  readonly metricsIntervalMs?: number;
  readonly enableCompositeMerge?: boolean;
}
