export interface ProjectContext {
  readonly projectId: string;
  readonly projectRoot: string;
  readonly workspaceRoot: string;
}

export interface PlatformContext {
  readonly project: ProjectContext;
  readonly platformName: string;
  readonly platformRoot: string;
}
