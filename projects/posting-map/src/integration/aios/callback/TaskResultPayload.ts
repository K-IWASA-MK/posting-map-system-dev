export interface TaskResultPayload {
  taskId: string;
  executionId: string;
  status: string;
  payload?: unknown;
  error?: unknown;
  metadata?: unknown;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
}
