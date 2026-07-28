import { ITestIsolationManager, IsolationReport } from './ITestIsolationManager';
import { SandboxContext, TestIsolationPolicy } from './SandboxContext';
import { RegistryResetManager } from './isolation/RegistryResetManager';
import { ResourceLifecycleManager } from './isolation/ResourceLifecycleManager';
import { ModuleCacheCleaner } from './isolation/ModuleCacheCleaner';
import * as fs from 'fs';

/**
 * TestIsolationManager coordinates file backups, registry resetting,
 * global event loop cleanup, and require cache pruning.
 */
export class TestIsolationManager implements ITestIsolationManager {
  private cacheSnapshot = new Set<string>();

  public async prepare(
    testFile: string,
    strategyName: string,
    policy: TestIsolationPolicy = 'Strict'
  ): Promise<SandboxContext> {
    const startTime = Date.now();

    // 1. Resolve capabilities from file annotations (dynamic parsing)
    const capabilities = TestIsolationManager.resolveCapabilities(testFile);

    // 2. Backup configuration files
    const backupMap = ResourceLifecycleManager.backupFiles();

    // 3. Install resource hooks (timers, processes, process listener snapshot)
    if (policy !== 'Fast') {
      ResourceLifecycleManager.hook();
    }

    // 4. Capture module cache snapshot to prune required files after execution
    this.cacheSnapshot = ModuleCacheCleaner.getCacheSnapshot();

    const context: SandboxContext = {
      testFile,
      capabilities,
      strategyName,
      startTime,
      policy,
      backupMap,
      resourceIds: [],
      cleanupTasks: []
    };

    // Track initial resources
    context.resourceIds.push(`backup-files:${backupMap.size}`);
    
    return context;
  }

  public async cleanup(context: SandboxContext): Promise<IsolationReport> {
    const startTime = Date.now();

    let timersReleased = 0;
    let listenersRemoved = 0;
    let registriesReset = 0;
    let moduleCacheCleared = 0;
    let filesRestored = 0;

    // 1. Run custom cleanups registered dynamically
    for (const task of context.cleanupTasks) {
      try {
        await task();
      } catch (err) {
        console.error(`[TestIsolationManager] Dynamic cleanup task failed:`, err);
      }
    }

    // 2. Prune new cache keys (require.cache cleaning)
    if (context.policy !== 'Fast') {
      moduleCacheCleared = ModuleCacheCleaner.pruneNewModules(this.cacheSnapshot);
      // Ensure the test file itself is cleared
      const testCleared = ModuleCacheCleaner.clearFile(context.testFile);
      if (testCleared) moduleCacheCleared++;
    }

    // 3. Clear timers, child processes, and event listeners
    if (context.policy !== 'Fast') {
      const res = ResourceLifecycleManager.cleanup();
      timersReleased = res.timersReleased;
      listenersRemoved = res.listenersRemoved;
      // Add child processes to the release list count if any were terminated
      timersReleased += res.processesKilled;
    }

    // 4. Reset registries
    if (context.policy !== 'Fast') {
      registriesReset = RegistryResetManager.resetAll();
    }

    // 5. Restore files
    filesRestored = ResourceLifecycleManager.restoreFiles(context.backupMap);

    const totalTime = Date.now() - startTime;

    return {
      testFile: context.testFile,
      timersReleased,
      listenersRemoved,
      registriesReset,
      moduleCacheCleared,
      filesRestored,
      totalTime
    };
  }

  /**
   * Helper to parse capability requirements declared in comments at the top of a file.
   * e.g., // @aios-test-capability: requiresFreshProcess, requiresRegistryReset
   */
  public static resolveCapabilities(testFile: string): string[] {
    try {
      if (fs.existsSync(testFile)) {
        const content = fs.readFileSync(testFile, 'utf8');
        const match = content.match(/\/\/ @aios-test-capability:\s*([^\r\n]+)/);
        if (match && match[1]) {
          return match[1].split(',').map(s => s.trim());
        }
      }
    } catch (err) {
      console.error(`[TestIsolationManager] Failed to read capabilities metadata:`, err);
    }
    return [];
  }
}
