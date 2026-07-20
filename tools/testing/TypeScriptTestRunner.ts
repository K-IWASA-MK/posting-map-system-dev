import { IPlatformTestRunner } from './IPlatformTestRunner';
import { TestResult } from './TestResult';
import { ITestExecutionStrategy } from './ITestExecutionStrategy';
import { StrategyResolver } from './StrategyResolver';
import { ExecutionPlan } from './ExecutionPlan';

/**
 * TypeScriptTestRunner executes discovered TS unit and integration tests.
 */
export class TypeScriptTestRunner implements IPlatformTestRunner {
  private readonly strategy: ITestExecutionStrategy;

  constructor(strategy?: ITestExecutionStrategy) {
    this.strategy = strategy || StrategyResolver.resolve();
  }

  public async runTests(input: string[] | ExecutionPlan): Promise<TestResult> {
    const suiteName = 'TypeScript Unit & Integration Tests';

    const plan: ExecutionPlan = Array.isArray(input) ? {
      entries: input.map(file => ({
        asset: {
          id: file,
          version: 1,
          name: file,
          module: file,
          category: 'legacy',
          tags: [],
          capabilities: [],
          timeout: 30000,
          enabled: true
        },
        strategyName: 'Sequential' as const,
        timeout: 30000,
        priority: 100
      }))
    } : input;
    
    if (plan.entries.length === 0) {
      return {
        suiteName,
        success: true,
        passedCount: 0,
        failedCount: 0,
        skipped: true,
        errors: []
      };
    }

    console.log(`[TypeScript Test Runner] Selected Strategy: ${this.strategy.name}`);
    console.log(`  Capabilities:`);
    console.log(`    - Isolation        : ${this.strategy.capabilities.supportsIsolation ? 'YES' : 'NO'}`);
    console.log(`    - Parallel         : ${this.strategy.capabilities.supportsParallel ? 'YES' : 'NO'}`);
    console.log(`    - Comp Cache       : ${this.strategy.capabilities.supportsCompilationCache ? 'YES' : 'NO'}`);
    console.log(`    - Deterministic    : ${this.strategy.capabilities.supportsDeterministicExecution ? 'YES' : 'NO'}`);
    console.log('--------------------------------------------------');

    const result = await this.strategy.execute(plan);

    console.log('--------------------------------------------------');
    console.log(`[TypeScript Test Runner] Strategy Execution Complete.`);
    console.log(`  Metrics:`);
    console.log(`    - Total Time       : ${result.metrics.totalTime} ms`);
    if (result.metrics.startupTime !== undefined) {
      console.log(`    - Process Startup  : ${result.metrics.startupTime} ms`);
    }
    if (result.metrics.compileTime !== undefined) {
      console.log(`    - TS compilation   : ${result.metrics.compileTime} ms`);
    }
    if (result.metrics.executionTime !== undefined) {
      console.log(`    - Test execution   : ${result.metrics.executionTime} ms`);
    }
    console.log('--------------------------------------------------');

    return {
      suiteName,
      success: result.success,
      passedCount: result.passedCount,
      failedCount: result.failedCount,
      skipped: false,
      errors: result.errors
    };
  }
}
