/**
 * ProjectCapability.ts
 * 
 * Declaration of capabilities supported/requested by a client project
 */

import { WorkflowCategory } from '../../../employee/workflow/types/WorkflowCategory';

export interface ProjectCapability {
  supportsWorkflowCategories: WorkflowCategory[];
  supportedTaskTypes: string[];
  supportedArtifactTypes?: string[];
  maxConcurrentTasks: number;
}
