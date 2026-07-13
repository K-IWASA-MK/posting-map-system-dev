export enum WorkflowFailurePolicy {
  FAIL_FAST = 'FAIL_FAST',
  CONTINUE = 'CONTINUE',
  RETRY = 'RETRY',
  ROLLBACK = 'ROLLBACK'
}

export interface WorkflowPolicy {
  failurePolicy: WorkflowFailurePolicy;
  maxRetries: number;
  timeoutMs: number;
}

export const DefaultWorkflowPolicy: WorkflowPolicy = {
  failurePolicy: WorkflowFailurePolicy.FAIL_FAST,
  maxRetries: 3,
  timeoutMs: 1000 * 60 * 60 // 1 hour
};
