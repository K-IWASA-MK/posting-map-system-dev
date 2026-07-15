import { WorkspaceContext } from './WorkspaceContext';
import * as path from 'path';

/**
 * WorkspaceContextBuilder compiles the paths and environmental configuration for a workspace.
 * Conforms to: Pure configuration mapping (does not execute IO mkdir/locks).
 */
export class WorkspaceContextBuilder {
  /**
   * Constructs the immutable WorkspaceContext.
   * @param sessionId Current Execution Session ID.
   * @param projectId Current Target Project ID.
   * @param workspacePath Directory path of the target workspace.
   * @param customEnv Base environment variables to inject.
   */
  public static build(
    sessionId: string,
    projectId: string,
    workspacePath: string,
    customEnv?: Record<string, string>
  ): WorkspaceContext {
    if (!sessionId) {
      throw new Error('WorkspaceContextBuilder requires sessionId');
    }
    if (!projectId) {
      throw new Error('WorkspaceContextBuilder requires projectId');
    }
    if (!workspacePath) {
      throw new Error('WorkspaceContextBuilder requires workspacePath');
    }

    const tempPath = path.join(workspacePath, 'tmp');
    const lockFilePath = path.join(workspacePath, `.lock-${projectId}`);
    
    const envBindings = {
      ...(customEnv || {}),
      AIOS_SESSION_ID: sessionId,
      AIOS_PROJECT_ID: projectId,
      AIOS_WORKSPACE_PATH: workspacePath,
      AIOS_TEMP_PATH: tempPath
    };

    return {
      sessionId,
      projectId,
      workspacePath,
      tempPath,
      lockFilePath,
      envBindings
    };
  }
}
