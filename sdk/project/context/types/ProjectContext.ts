/**
 * ProjectContext.ts
 * 
 * Context model capturing client project state, capability, policy, and task request metadata
 */

import { ProjectProfile } from '../../types/ProjectProfile';
import { ProjectCapability } from '../../capability/types/ProjectCapability';
import { ProjectPolicy } from '../../policy/types/ProjectPolicy';

export interface ProjectContext {
  projectId: string;
  projectName: string;
  environment: string;
  capability: ProjectCapability;
  policy: ProjectPolicy;
  workflowParameters?: Record<string, any>;
  securityContext?: Record<string, any>;
  requestMetadata?: Record<string, any>;
  createdAt: string;
}
