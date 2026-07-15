import { WorkspaceContext } from './WorkspaceContext';
import { WorkspaceLockManager } from './WorkspaceLockManager';
import { TempDirectoryManager } from './TempDirectoryManager';
import { WorkspaceRuntimeError } from './WorkspaceRuntimeErrors';

/**
 * WorkspaceRuntimePreparer coordinates the lock acquisitions and temp path setups.
 * Conforms to: environment boundaries setup only (no process spawning, no history stores).
 */
export class WorkspaceRuntimePreparer {
  private readonly lockManager: WorkspaceLockManager;
  private readonly tempManager: TempDirectoryManager;

  constructor(lockManager: WorkspaceLockManager, tempManager: TempDirectoryManager) {
    this.lockManager = lockManager;
    this.tempManager = tempManager;
  }

  /**
   * Acquires the session runtime lock and creates necessary sandboxed temp paths.
   * Throws WorkspaceRuntimeError on locks or folder setup failures.
   * @param context Active compiled WorkspaceContext.
   */
  public async prepare(context: WorkspaceContext): Promise<void> {
    const lockAcquired = await this.lockManager.acquireLock(context.lockFilePath, context.sessionId);
    if (!lockAcquired) {
      throw new WorkspaceRuntimeError(
        'WORKSPACE_LOCKED',
        `Workspace directory for project '${context.projectId}' is locked by another session.`
      );
    }

    try {
      this.tempManager.create(context.tempPath);
    } catch (err: any) {
      // Revert lock state to prevent deadlock on folder setup failure
      await this.lockManager.releaseLock(context.lockFilePath);
      throw new WorkspaceRuntimeError(
        'TEMP_DIRECTORY_FAILED',
        `Failed to allocate temp space. ${err.message}`
      );
    }
  }
}
