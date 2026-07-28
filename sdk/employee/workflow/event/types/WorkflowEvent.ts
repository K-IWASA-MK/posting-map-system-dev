/**
 * WorkflowEvent.ts
 * 
 * Immutable Workflow Event Data Model
 */

import { WorkflowEventType } from './WorkflowEventType';

export interface WorkflowEvent<T = any> {
  eventId: string;
  type: WorkflowEventType;
  instanceId: string;
  taskId: string;
  stageId?: string;
  payload: T;
  timestamp: string;
}
