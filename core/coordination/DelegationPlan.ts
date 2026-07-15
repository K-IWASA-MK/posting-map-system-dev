export interface DelegationPlan {
  readonly executionMode: "SYNC" | "ASYNC" | "BATCH";
  readonly priority: number;
  readonly timeoutMs: number;
  readonly rollbackRequired: boolean;
  readonly validationRequired: boolean;
}
