/**
 * IProjectAdapter.ts
 * 
 * Hexagonal Architecture Interface for Client Project Adapters
 */

import { ProjectProfile } from '../../types/ProjectProfile';
import { ProjectTaskRequest } from '../../intake/types/ProjectTaskRequest';
import { ProjectResult } from '../../result/types/ProjectResult';

export interface IProjectAdapter {
  getProfile(): ProjectProfile;
  createTaskRequest(taskType: string, payload: Record<string, any>, parameters?: Record<string, any>): ProjectTaskRequest;
  handleCallback?(result: ProjectResult): void | Promise<void>;
}
