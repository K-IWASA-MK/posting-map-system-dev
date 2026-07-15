import { ILockStorage } from './ILockStorage';

/**
 * WorkspaceLockManager provides mutual exclusion locks using pluggable lock storage.
 */
export class WorkspaceLockManager {
  private readonly storage: ILockStorage;

  constructor(storage: ILockStorage) {
    this.storage = storage;
  }

  /**
   * Tries to acquire a lock by writing the session ID.
   * Returns false if lock is already held.
   */
  public async acquireLock(lockFilePath: string, sessionId: string): Promise<boolean> {
    if (this.storage.exists(lockFilePath)) {
      return false;
    }
    try {
      this.storage.write(lockFilePath, sessionId);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Releases lock by deleting the lock file/record.
   */
  public async releaseLock(lockFilePath: string): Promise<void> {
    try {
      this.storage.delete(lockFilePath);
    } catch (err: any) {
      throw new Error(`LOCK_RELEASE_FAILED: Failed to release lock at '${lockFilePath}'. ${err.message}`);
    }
  }

  /**
   * Checks if lock is currently held.
   */
  public isLocked(lockFilePath: string): boolean {
    return this.storage.exists(lockFilePath);
  }
}
