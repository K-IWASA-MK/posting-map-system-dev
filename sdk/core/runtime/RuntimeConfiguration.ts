export interface RuntimeConfiguration {
  retryPolicy: {
    maxRetries: number;
    backoffMs: number;
  };
  timeout: number;
  concurrency: number;
  logging: {
    level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  };
  observability: {
    metricsEnabled: boolean;
    tracingEnabled: boolean;
  };
  featureFlags: Record<string, boolean>;
  resourceLimits: {
    cpuShares: number;
    memoryLimitBytes: number;
    maxQueueDepth: number;
  };
}
