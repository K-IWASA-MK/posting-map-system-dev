import { ITestExecutionStrategy } from './ITestExecutionStrategy';
import { SequentialExecutionStrategy } from './strategies/SequentialExecutionStrategy';
import { BatchExecutionStrategy } from './strategies/BatchExecutionStrategy';

/**
 * StrategyResolver determines which test execution strategy to run
 * based on process arguments, environment variables, or default policy rules.
 */
export class StrategyResolver {
  /**
   * Resolves the strategy using the following priority:
   * 1. Command-line argument `--strategy=<name>`
   * 2. Environment variable `AIOS_TEST_STRATEGY`
   * 3. Fallback default strategy (Sequential)
   */
  public static resolve(args: string[] = process.argv, env: Record<string, string | undefined> = process.env): ITestExecutionStrategy {
    // 1. Check command line arguments (e.g. --strategy=batch)
    for (const arg of args) {
      if (arg.startsWith('--strategy=')) {
        const strategyName = arg.split('=')[1]?.toLowerCase();
        if (strategyName === 'batch') {
          return new BatchExecutionStrategy();
        }
        if (strategyName === 'sequential') {
          return new SequentialExecutionStrategy();
        }
      }
    }

    // 2. Check environment variable
    const envStrategy = env.AIOS_TEST_STRATEGY?.toLowerCase();
    if (envStrategy === 'batch') {
      return new BatchExecutionStrategy();
    }
    if (envStrategy === 'sequential') {
      return new SequentialExecutionStrategy();
    }

    // 3. Fallback Default (Deterministic sequential)
    return new SequentialExecutionStrategy();
  }
}
