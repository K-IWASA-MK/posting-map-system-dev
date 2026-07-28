/**
 * ProjectCallback.ts
 * 
 * Callback Notification interface for Client Projects
 */

import { ProjectResult } from './ProjectResult';

export interface ProjectCallback {
  callbackId: string;
  projectId: string;
  onSuccess?: (result: ProjectResult) => void | Promise<void>;
  onFailure?: (result: ProjectResult) => void | Promise<void>;
  onProgress?: (progressData: Record<string, any>) => void | Promise<void>;
}
