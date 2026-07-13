import { WorkspaceType } from './WorkspaceType';
import { RepositoryManifest } from '../repository/RepositoryManifest';

export interface WorkspaceManifest {
  workspaceId: string;
  workspaceName: string;
  rootDirectory: string;
  workspaceType: WorkspaceType;
  owner: string;
  version: string;
  // This could just be repository names or paths, but we'll allow embedded or referenced manifests.
  repositories: Array<string | RepositoryManifest>;
}
