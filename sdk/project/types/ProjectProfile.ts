/**
 * ProjectProfile.ts
 * 
 * Immutable Profile of a Client Project registered in AIOS
 */

import { ProjectId } from './ProjectId';
import { ProjectType } from './ProjectType';
import { ProjectMetadata } from './ProjectMetadata';
import { ProjectCapability } from '../capability/types/ProjectCapability';
import { ProjectPolicy } from '../policy/types/ProjectPolicy';

export interface ProjectProfile {
  projectId: ProjectId;
  projectName: string;
  projectType: ProjectType;
  description: string;
  capability: ProjectCapability;
  policy: ProjectPolicy;
  metadata: ProjectMetadata;
  createdAt: string;
}
