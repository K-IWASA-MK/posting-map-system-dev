import { RuntimeManifest } from '../runtime/RuntimeManifest';
import { DeploymentStage } from './DeploymentModels';

export interface DeploymentManifest extends RuntimeManifest {
  projectId: string;
  repositoryId?: string;
  releaseId?: string;
  pipeline: DeploymentStage[];
  environment: string; // e.g. "production", "staging"
  targetVersion?: string;
}
