import { TestExecutionContext } from './TestContext';

/**
 * Standard contract for all AIOS test modules.
 */
export interface ITestModule {
  /**
   * Executes the test suite logic under the runner's control.
   * @param context Provides test-specific environment and cleanup registration.
   */
  execute(context: TestExecutionContext): Promise<void>;
}
