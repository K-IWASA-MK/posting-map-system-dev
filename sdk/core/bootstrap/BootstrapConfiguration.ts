export interface RuntimePolicy {
  readonly executionTimeoutMs: number;
  readonly retryCount: number;
  readonly failFast: boolean;
}

export interface BootstrapConfiguration {
  readonly plugins: string[];
  readonly reviewers: string[];
  readonly storageAdapter: string;
  readonly runtimePolicy: RuntimePolicy;
  readonly environment: string;
}
