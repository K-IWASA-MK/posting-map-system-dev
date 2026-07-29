import { TaskStatus } from './TaskStatus';
import { ResultMetadata } from './ResultMetadata';
import { ResultError } from './ResultError';

/**
 * TaskResult.ts
 * 
 * Standard output contract for AIOS.
 * This is the Single Source of Truth (SSOT) shared across Workflow, Agent, Audit,
 * Learning, and Knowledge layers. It must remain Runtime-agnostic.
 */
export interface TaskResult {
  readonly taskId: string;
  readonly executionId: string;
  readonly status: TaskStatus;
  readonly startedAt: Date;
  readonly completedAt: Date;
  readonly duration: number; // milliseconds
  readonly payload?: unknown;
  readonly error?: ResultError;
  readonly metadata: ResultMetadata;
}
