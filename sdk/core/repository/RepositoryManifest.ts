import { RepositoryType } from './RepositoryType';

export interface RepositoryManifest {
  repositoryName: string;
  repositoryType: RepositoryType;
  owner: string;
  visibility: 'public' | 'private';
  defaultBranch?: string;
  labels?: string[];
  topics?: string[];
  dryRun?: boolean;
}
