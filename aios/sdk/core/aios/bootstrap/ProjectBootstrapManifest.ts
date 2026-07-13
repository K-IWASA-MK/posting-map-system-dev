export interface ProjectBootstrapManifest {
  projectName: string;
  repositoryType: string;
  visibility: 'public' | 'private' | 'internal';
  owner: string;
  license: string;
  readme: boolean;
  gitignore: string; // e.g., 'Node', 'Python'
  defaultBranch: string;
  initializeGit: boolean;
  createRepository: boolean;
  createRelease: boolean;
  createActions: boolean;
  pushInitialCommit: boolean;
  createInitialTag: boolean;
  createInitialRelease: boolean;
  dryRun: boolean;
}
