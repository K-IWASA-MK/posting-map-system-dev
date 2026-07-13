export interface ExecutionPolicy {
  maxExecutionTimeMs: number;
  allowParallelExecution: boolean;
}

export interface DependencyPolicy {
  failOnMissingOptional: boolean;
  autoResolveVersionConflicts: boolean;
}

export interface LifecyclePolicy {
  autoStartOnBoot: boolean;
  gracefulShutdownTimeoutMs: number;
}

export interface ResourcePolicy {
  failOnResourceExhaustion: boolean;
  autoScale: boolean;
}

export interface RuntimePolicy {
  execution: ExecutionPolicy;
  dependency: DependencyPolicy;
  lifecycle: LifecyclePolicy;
  resource: ResourcePolicy;
}
