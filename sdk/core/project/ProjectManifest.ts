import { RuntimeManifest } from '../runtime/RuntimeManifest';
import { Project } from './ProjectModels';

export interface ProjectManifest extends RuntimeManifest {
  projectName: string;
  workspaceId: string;
  description: string;
  initialStructure?: {
    epics?: string[];
    sprints?: number;
  };
}
