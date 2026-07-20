import { StrategyExecutionResult } from './StrategyExecutionResult';
import { ExecutionPlan } from './ExecutionPlan';

/**
 * StrategyCapabilities defines the runtime traits of a test execution strategy.
 */
export interface StrategyCapabilities {
  supportsIsolation: boolean;             // Runs tests in a fresh process/VM boundary
  supportsParallel: boolean;              // Concurrently executes tests
  supportsCompilationCache: boolean;      // Reuses compiled JS / compilation states
  supportsDeterministicExecution: boolean;// Execution is ordered and free of race conditions
}

/**
 * ITestExecutionStrategy is the abstract interface representing a way to run tests.
 */
export interface ITestExecutionStrategy {
  readonly name: string;
  readonly capabilities: StrategyCapabilities;

  /**
   * Executes the given execution plan of test files using this strategy.
   * @param plan Discovered test execution plan.
   */
  execute(plan: ExecutionPlan): Promise<StrategyExecutionResult>;
}
