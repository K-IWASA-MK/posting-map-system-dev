import { TaskResult } from '../results/TaskResult';

/**
 * PipelineResult.ts
 * 
 * Standard result model for the Execution Pipeline.
 * Wraps the underlying TaskResult with pipeline execution metrics.
 * Not a replacement for ExecutionResult, but a summary of the pipeline orchestration.
 */
export interface PipelineResult {
  readonly taskResult: TaskResult;
  readonly executionTime: number; // in milliseconds
  readonly completedAt: Date;
  readonly metadata: Readonly<Record<string, unknown>>;
}
