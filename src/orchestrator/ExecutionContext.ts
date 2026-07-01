export interface ExecutionContext {
  executionId: string;
  runtimeId: string;
  phase: string;
  triggerEventId: string;
  governancePolicyId: string;
  scopeId: string;
  correlationId?: string;
  priority?: string;
}
