import { WorkspaceContext } from './WorkspaceContext';
import { WorkspaceLockManager } from './WorkspaceLockManager';
import { TempDirectoryManager } from './TempDirectoryManager';
import { WorkspaceRuntimeError } from './WorkspaceRuntimeErrors';

/**
 * WorkspaceRuntimeTeardown handles the cleanup of sandboxed temp spaces and releases locks.
 * Conforms to: cleanup files in temp directory without deleting parent workspaces.
 */
export class WorkspaceRuntimeTeardown {
  private readonly lockManager: WorkspaceLockManager;
  private readonly tempManager: TempDirectoryManager;

  constructor(lockManager: WorkspaceLockManager, tempManager: TempDirectoryManager) {
    this.lockManager = lockManager;
    this.tempManager = tempManager;
  }

  /**
   * Safe clean of temporary workspace entries and release lock.
   * Throws WorkspaceRuntimeError on teardown or release failures.
   * @param context Active compiled WorkspaceContext.
   */
  public async teardown(context: WorkspaceContext): Promise<void> {
    try {
      this.tempManager.cleanup(context.tempPath);
    } catch (err: any) {
      throw new WorkspaceRuntimeError(
        'TEMP_DIRECTORY_FAILED',
        `Failed to cleanup session temp files. ${err.message}`
      );
    }

    try {
      await this.lockManager.releaseLock(context.lockFilePath);
    } catch (err: any) {
      throw new WorkspaceRuntimeError(
        'LOCK_RELEASE_FAILED',
        `Failed to release session lock. ${err.message}`
      );
    }
  }
}
