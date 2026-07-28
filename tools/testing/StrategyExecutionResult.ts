/**
 * ExecutionMetrics captures quantitative timing of test runs.
 */
export interface ExecutionMetrics {
  totalTime: number; // in milliseconds
  startupTime?: number;
  compileTime?: number;
  executionTime?: number;
  cleanupTime?: number;
}

/**
 * StrategyExecutionResult contains the outcome and metrics of the strategy execution.
 */
export interface StrategyExecutionResult {
  success: boolean;
  passedCount: number;
  failedCount: number;
  errors: string[];
  metrics: ExecutionMetrics;
}
