/**
 * ProjectTaskRequest.ts
 * 
 * Task Request submitted by a client project to AIOS Project Bridge
 */

export interface ProjectTaskRequest {
  requestId: string;
  projectId: string;
  taskType: string;
  payload: Record<string, any>;
  parameters?: Record<string, any>;
  timestamp: string;
}
