import { LockScope } from './types/LockScope';
import { LockAcquisitionFailedException } from './exceptions/BrowserWorkerExceptions';

export interface LockRecord {
  scope: LockScope;
  targetKey: string;
  ownerAgentId: string;
  acquiredAt: number;
  expiresAt: number;
}

export class BrowserLockManager {
  private locks: Map<string, LockRecord> = new Map();
  private lockContentionCount: number = 0;
  private deadlockRecoveryCount: number = 0;

  public acquireLock(scope: LockScope, targetKey: string, agentId: string, ttlMs: number = 30000): boolean {
    this.cleanExpiredLocks();
    const lockId = `${scope}:${targetKey}`;
    const existing = this.locks.get(lockId);

    if (existing) {
      if (existing.ownerAgentId === agentId) {
        // Re-entrant lock
        return true;
      }
      this.lockContentionCount++;
      throw new LockAcquisitionFailedException(`Lock contention: ${scope} '${targetKey}' is currently locked by Agent '${existing.ownerAgentId}'.`);
    }

    const now = Date.now();
    this.locks.set(lockId, {
      scope,
      targetKey,
      ownerAgentId: agentId,
      acquiredAt: now,
      expiresAt: now + ttlMs
    });

    return true;
  }

  public releaseLock(scope: LockScope, targetKey: string, agentId: string): boolean {
    const lockId = `${scope}:${targetKey}`;
    const existing = this.locks.get(lockId);

    if (existing && existing.ownerAgentId === agentId) {
      this.locks.delete(lockId);
      return true;
    }
    return false;
  }

  public cleanExpiredLocks(): number {
    const now = Date.now();
    let cleaned = 0;
    for (const [key, lock] of this.locks.entries()) {
      if (now > lock.expiresAt) {
        this.locks.delete(key);
        this.deadlockRecoveryCount++;
        cleaned++;
      }
    }
    return cleaned;
  }

  public isLocked(scope: LockScope, targetKey: string): boolean {
    this.cleanExpiredLocks();
    return this.locks.has(`${scope}:${targetKey}`);
  }

  public getLockOwner(scope: LockScope, targetKey: string): string | null {
    const lock = this.locks.get(`${scope}:${targetKey}`);
    return lock ? lock.ownerAgentId : null;
  }

  public getContentionCount(): number {
    return this.lockContentionCount;
  }

  public getDeadlockRecoveryCount(): number {
    return this.deadlockRecoveryCount;
  }
}
