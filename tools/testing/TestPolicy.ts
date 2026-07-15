import { TestResult, TestSummary } from './TestResult';

/**
 * TestPolicy judges the final outcome of the aggregated test suite results.
 * Strictly separates execution status mapping from runners.
 */
export class TestPolicy {
  /**
   * Evaluates the list of test outcomes and produces a unified TestSummary.
   * @param results Array of completed test suite results.
   */
  public static evaluateSummary(results: TestResult[]): TestSummary {
    let totalSuiteCount = results.length;
    let totalPassed = 0;
    let totalFailed = 0;
    let hasFailures = false;
    let allSkipped = true;

    for (const res of results) {
      totalPassed += res.passedCount;
      totalFailed += res.failedCount;
      if (res.failedCount > 0 || !res.success) {
        hasFailures = true;
      }
      if (!res.skipped) {
        allSkipped = false;
      }
    }

    let decision: 'PASS' | 'FAIL' | 'SKIPPED' = 'PASS';
    if (hasFailures) {
      decision = 'FAIL';
    } else if (allSkipped && totalSuiteCount > 0) {
      decision = 'SKIPPED';
    }

    const success = decision !== 'FAIL';

    return {
      success,
      decision,
      results,
      totalSuiteCount,
      totalPassed,
      totalFailed
    };
  }
}
