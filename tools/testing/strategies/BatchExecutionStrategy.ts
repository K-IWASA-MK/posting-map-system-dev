import { ITestExecutionStrategy, StrategyCapabilities } from '../ITestExecutionStrategy';
import { StrategyExecutionResult } from '../StrategyExecutionResult';
import { TestIsolationManager } from '../TestIsolationManager';
import { SequentialExecutionStrategy } from './SequentialExecutionStrategy';
import * as path from 'path';
import * as fs from 'fs';

/**
 * BatchExecutionStrategy loads and executes multiple test files inside the current process,
 * sharing the TypeScript compilation context to maximize execution speed,
 * and utilizing TestIsolationManager to ensure safe environment resets.
 * If a file requires a fresh process, it routes it dynamically to Sequential execution.
 */
export class BatchExecutionStrategy implements ITestExecutionStrategy {
  public readonly name = 'Batch';
  public readonly capabilities: StrategyCapabilities = {
    supportsIsolation: true,
    supportsParallel: false,
    supportsCompilationCache: true,
    supportsDeterministicExecution: true
  };

  private checkIsStandardTest(filePath: string): boolean {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return content.includes('implements ITestModule') ||
             content.includes('TestExecutionContext') ||
             /export\s+default\s+class/.test(content);
    } catch (err) {
      return false;
    }
  }

  private async runWithTimeout(fn: () => Promise<void>, ms: number): Promise<void> {
    let timer: NodeJS.Timeout | undefined;
    const timeoutPromise = new Promise<void>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`Test execution timed out after ${ms}ms`)), ms);
    });
    try {
      await Promise.race([fn(), timeoutPromise]);
    } finally {
      if (timer) {
        clearTimeout(timer);
      }
    }
  }

  public async execute(testFiles: string[]): Promise<StrategyExecutionResult> {
    const startTime = Date.now();
    let passedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];
    let totalCleanupTime = 0;

    // 1. Partition files by capability requirements and execution model
    const sequentialFiles: string[] = [];
    const batchFiles: string[] = [];

    for (const file of testFiles) {
      const caps = TestIsolationManager.resolveCapabilities(file);
      const isStandard = this.checkIsStandardTest(file);

      if (caps.includes('requiresFreshProcess') || !isStandard) {
        sequentialFiles.push(file);
      } else {
        batchFiles.push(file);
      }
    }

    // 2. Execute files that require a fresh process or are legacy using SequentialExecutionStrategy
    let sequentialTime = 0;
    if (sequentialFiles.length > 0) {
      console.log(`[Batch Strategy] Routing ${sequentialFiles.length} file(s) to Sequential execution...`);
      const seqStrategy = new SequentialExecutionStrategy();
      const seqResult = await seqStrategy.execute(sequentialFiles);
      
      passedCount += seqResult.passedCount;
      failedCount += seqResult.failedCount;
      errors.push(...seqResult.errors);
      sequentialTime = seqResult.metrics.totalTime;
    }

    if (batchFiles.length === 0) {
      const totalTime = Date.now() - startTime;
      return {
        success: failedCount === 0,
        passedCount,
        failedCount,
        errors,
        metrics: {
          totalTime,
          startupTime: 0,
          compileTime: 0,
          executionTime: totalTime - sequentialTime,
          cleanupTime: 0
        }
      };
    }

    // 3. Intercept process.exit to prevent individual failing tests from terminating the entire runner
    const originalExit = process.exit;
    const originalExitCode = process.exitCode;

    // Use a flag to track if a test called process.exit with an error code
    let exitInterceptedError: string | null = null;

    // Type definition for process.exit mock
    (process as any).exit = (code?: number) => {
      const exitCode = code === undefined ? 0 : code;
      if (exitCode !== 0) {
        const errorMsg = `process.exit(${exitCode}) was intercepted.`;
        exitInterceptedError = errorMsg;
        throw new Error(errorMsg);
      }
    };

    const compilationStart = Date.now();
    // Pre-resolve all files to ensure they can be imported
    const absoluteFiles = batchFiles.map(file => path.resolve(file));
    const compileTime = Date.now() - compilationStart;

    const executionStart = Date.now();
    const isolationManager = new TestIsolationManager();

    for (const file of absoluteFiles) {
      exitInterceptedError = null;
      
      // Prepare isolation context
      const context = await isolationManager.prepare(file, this.name, 'Strict');
      
      try {
        // Clear require cache for the file to ensure clean evaluation
        if (require.cache[file]) {
          delete require.cache[file];
        }

        // Load the standard test module
        const testModule = require(file);
        
        let testInstance: any;
        if (typeof testModule.default === 'function') {
          testInstance = new testModule.default();
        } else if (testModule.default && typeof testModule.default.execute === 'function') {
          testInstance = testModule.default;
        } else {
          throw new Error(`Invalid test module contract: default export does not implement ITestModule`);
        }

        const metadata = testInstance.metadata || testInstance.constructor?.metadata || {};
        const timeout = metadata.timeout || 30000; // Default 30s timeout

        // Construct context wrappers
        const testCtx = {
          testFile: file,
          strategyName: this.name,
          policy: 'Strict' as const,
          registerCleanupTask: (task: () => Promise<void> | void) => {
            context.cleanupTasks.push(task);
          }
        };

        const execCtx = {
          env: { ...process.env },
          capabilities: metadata.capabilities || []
        };

        const testExecContext = {
          test: testCtx,
          execution: execCtx
        };

        // Await the standard test module execution under runner control
        await this.runWithTimeout(() => testInstance.execute(testExecContext), timeout);
        
        passedCount++;
      } catch (err: any) {
        failedCount++;
        const displayError = exitInterceptedError || err.message || 'Unknown error';
        errors.push(`Test file failed in batch: ${path.basename(file)}\nError: ${displayError}\nStack: ${err.stack || ''}`);
      } finally {
        // Clean up environment and generate report
        const report = await isolationManager.cleanup(context);
        totalCleanupTime += report.totalTime;

        // Print Diagnostic Isolation Report
        console.log(`[Isolation Report] ${path.basename(file)}:`);
        console.log(`  - Timers Released     : ${report.timersReleased}`);
        console.log(`  - Listeners Removed   : ${report.listenersRemoved}`);
        console.log(`  - Registries Reset    : ${report.registriesReset}`);
        console.log(`  - Modules Uncached    : ${report.moduleCacheCleared}`);
        console.log(`  - Files Restored      : ${report.filesRestored}`);
        console.log(`  - Cleanup Time        : ${report.totalTime} ms`);
        console.log('--------------------------------------------------');
      }
    }

    const executionTime = Date.now() - executionStart - totalCleanupTime;

    // Restore original exit behavior
    process.exit = originalExit;
    if (originalExitCode !== undefined) {
      process.exitCode = originalExitCode;
    }

    const totalTime = Date.now() - startTime;

    return {
      success: failedCount === 0,
      passedCount,
      failedCount,
      errors,
      metrics: {
        totalTime,
        startupTime: 0,
        compileTime,
        executionTime: executionTime + sequentialTime,
        cleanupTime: totalCleanupTime
      }
    };
  }
}
