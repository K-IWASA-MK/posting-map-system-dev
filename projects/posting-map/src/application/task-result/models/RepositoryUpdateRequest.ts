export interface RepositoryUpdateRequest {
  taskId: string;
  idempotencyKey: string;
  status: string;
  completedAt?: Date;
  metadata?: unknown;
}
