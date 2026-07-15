import { RepositoryManifest } from '../RepositoryManifest';

export interface IGitHubAdapter {
  checkAuth(): Promise<boolean>;
  createRepository(manifest: RepositoryManifest): Promise<string>;
  deleteRepository(owner: string, repositoryName: string): Promise<void>;
  archiveRepository(owner: string, repositoryName: string): Promise<void>;
  renameRepository(owner: string, oldName: string, newName: string): Promise<void>;
  forkRepository(owner: string, repositoryName: string, org?: string): Promise<string>;
  listRepositories(owner: string): Promise<any[]>;
  listBranches(owner: string, repositoryName: string): Promise<any[]>;
  listTags(owner: string, repositoryName: string): Promise<any[]>;
  createRelease(owner: string, repositoryName: string, tag: string, title: string, notes: string): Promise<void>;
  createPullRequest(owner: string, repositoryName: string, title: string, body: string, head: string, base: string): Promise<string>;
  mergePullRequest(owner: string, repositoryName: string, prNumber: number): Promise<void>;
  protectBranch(owner: string, repositoryName: string, branch: string): Promise<void>;
  createWebhook(owner: string, repositoryName: string, url: string, secret: string): Promise<void>;
}
