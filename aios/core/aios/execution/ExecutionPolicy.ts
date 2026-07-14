export enum ExecutionIsolation {
  PROCESS = "PROCESS",
  THREAD = "THREAD",
  SANDBOX = "SANDBOX",
  CONTAINER = "CONTAINER",
  REMOTE = "REMOTE"
}

export enum RollbackPolicy {
  FULL = "FULL",
  PARTIAL = "PARTIAL",
  STEP = "STEP",
  MANUAL = "MANUAL"
}

export enum TimeoutPolicy {
  HARD_TIMEOUT = "HARD_TIMEOUT",
  SOFT_TIMEOUT = "SOFT_TIMEOUT",
  WARNING_ONLY = "WARNING_ONLY"
}

export interface ExecutionPolicy {
  readonly retryAllowed: boolean;
  readonly rollback: RollbackPolicy;
  readonly timeout: TimeoutPolicy;
  readonly isolation: ExecutionIsolation;
}
