export interface AuditRecordRequest {
  taskId: string;
  eventType: string; // e.g., 'TASK_COMPLETED', 'TASK_FAILED', 'TASK_CANCELLED'
  executionId: string;
  timestamp: Date;
  details: unknown;
}
