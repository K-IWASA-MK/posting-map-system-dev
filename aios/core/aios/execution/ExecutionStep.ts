export interface ExecutionStep {
  readonly stepId: string;
  readonly action: string;
  readonly timeoutMs: number;
  readonly retryAllowed: boolean;
  readonly rollbackAction?: string;
}
