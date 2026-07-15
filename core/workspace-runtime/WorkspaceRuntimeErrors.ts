/**
 * WorkspaceErrorCode lists error conditions occurring in the workspace plane.
 */
export type WorkspaceErrorCode = 'WORKSPACE_LOCKED' | 'TEMP_DIRECTORY_FAILED' | 'LOCK_RELEASE_FAILED';

/**
 * WorkspaceRuntimeError represents exceptions thrown during environment preparation or teardown.
 */
export class WorkspaceRuntimeError extends Error {
  public readonly errorCode: WorkspaceErrorCode;

  constructor(errorCode: WorkspaceErrorCode, message: string) {
    super(`[${errorCode}] ${message}`);
    this.name = 'WorkspaceRuntimeError';
    this.errorCode = errorCode;
  }
}
