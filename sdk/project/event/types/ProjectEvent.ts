/**
 * ProjectEvent.ts
 * 
 * Immutable Project Event Model
 */

import { ProjectEventType } from './ProjectEventType';

export interface ProjectEvent<T = any> {
  eventId: string;
  type: ProjectEventType;
  projectId: string;
  taskId?: string;
  payload: T;
  timestamp: string;
}
