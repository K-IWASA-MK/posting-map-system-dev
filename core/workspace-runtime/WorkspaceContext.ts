/**
 * WorkspaceContext defines the prepared environmental settings for an execution session.
 */
export interface WorkspaceContext {
  readonly sessionId: string;
  readonly projectId: string;
  readonly workspacePath: string;
  readonly tempPath: string;
  readonly lockFilePath: string;
  readonly envBindings: Record<string, string>;
}
