export interface OrchestrationPlan {
  readonly orchestrationId: string;
  readonly executionId: string;
  readonly workerIds: readonly string[];
}
