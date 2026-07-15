export enum WorkflowState {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export interface WorkflowJob {
  id: string;
  workflowId: string;
  state: WorkflowState;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  errorReason?: string;
}
