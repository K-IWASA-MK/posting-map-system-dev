import { GasConfigurationProvider } from './GasConfigurationProvider';

export class LockServiceProvider {
  private static instance: LockServiceProvider | null = null;
  private configProvider: GasConfigurationProvider;

  private constructor() {
    this.configProvider = GasConfigurationProvider.getInstance();
  }

  public static getInstance(): LockServiceProvider {
    if (!LockServiceProvider.instance) {
      LockServiceProvider.instance = new LockServiceProvider();
    }
    return LockServiceProvider.instance;
  }

  /**
   * ロックを取得してアクションを実行する。実行後は確実にロックを解放する。
   */
  public executeWithLock<T>(action: () => T): T {
    if (typeof LockService === 'undefined') {
      // 非GAS環境（Nodeテスト等）では直接アクションを実行
      return action();
    }

    const lock = LockService.getScriptLock();
    const timeoutMs = this.configProvider.getLockTimeout();
    const hasLock = lock.tryLock(timeoutMs);

    if (!hasLock) {
      throw new Error(`Lock Timeout: Failed to acquire script lock within ${timeoutMs}ms.`);
    }

    try {
      return action();
    } finally {
      try {
        lock.releaseLock();
      } catch (releaseError) {
        console.error('[LockServiceProvider] Error releasing lock:', releaseError);
      }
    }
  }
}

// Global declaration for GAS type safety during compiler checks
declare const LockService: any;
