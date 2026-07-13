export interface SafetyPolicy {
  readonly requireHumanApproval: boolean;
  readonly maxConcurrentOptimizations: number;
  readonly autoRollbackOnFailure: boolean;
}
