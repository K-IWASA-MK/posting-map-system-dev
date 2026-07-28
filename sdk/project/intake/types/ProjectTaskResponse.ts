/**
 * ProjectTaskResponse.ts
 * 
 * Immediate acknowledgement response sent to a client project upon task intake
 */

export interface ProjectTaskResponse {
  requestId: string;
  projectId: string;
  taskId: string;
  status: 'ACCEPTED' | 'REJECTED';
  rejectionReason?: string;
  receivedAt: string;
}
