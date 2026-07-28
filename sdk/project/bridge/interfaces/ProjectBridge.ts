/**
 * ProjectBridge.ts
 * 
 * Unified Interface for AIOS Project Bridge
 */

import { ProjectTaskRequest } from '../../intake/types/ProjectTaskRequest';
import { ProjectTaskResponse } from '../../intake/types/ProjectTaskResponse';
import { ProjectResult } from '../../result/types/ProjectResult';
import { ProjectCallback } from '../../result/types/ProjectCallback';

export interface ProjectBridge {
  submitTask(request: ProjectTaskRequest): { response: ProjectTaskResponse; result?: ProjectResult };
  registerCallback(callback: ProjectCallback): () => void;
}
