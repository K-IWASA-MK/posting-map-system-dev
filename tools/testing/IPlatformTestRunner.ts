import { TestResult } from './TestResult';

/**
 * IPlatformTestRunner defines the common interface for specific language/framework test executors.
 */
export interface IPlatformTestRunner {
  /**
   * Executes the specified array of test files and returns the result.
   * @param testFiles Discovered test file paths.
   */
  runTests(testFiles: string[]): Promise<TestResult>;
}
