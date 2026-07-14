export enum StepResult {
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  SKIPPED = "SKIPPED",
  ROLLED_BACK = "ROLLED_BACK"
}

export enum ExecutionResult {
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  PARTIAL = "PARTIAL",
  TIMEOUT = "TIMEOUT",
  ROLLED_BACK = "ROLLED_BACK",
  CANCELLED = "CANCELLED"
}

export interface ResultSummary {
  readonly durationMs: number;
  readonly totalSteps: number;
  readonly errorCount: number;
  readonly isRolledBack: boolean;
  readonly retryCount: number;
}
