/**
 * TestResult represents the outcome of an individual language/framework test suite.
 */
export interface TestResult {
  suiteName: string;
  success: boolean;
  passedCount: number;
  failedCount: number;
  skipped: boolean;
  errors: string[];
}

/**
 * TestSummary aggregates all test suite executions and records the overall platform gate decision.
 */
export interface TestSummary {
  success: boolean;
  decision: 'PASS' | 'FAIL' | 'SKIPPED';
  results: TestResult[];
  totalSuiteCount: number;
  totalPassed: number;
  totalFailed: number;
}
