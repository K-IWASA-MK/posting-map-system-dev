/**
 * ExecutionResult.ts
 * 
 * Standardized, Runtime-agnostic result model.
 * All Runtimes must return this exact shape wrapped in a Promise.
 */
export interface ExecutionResult {
  readonly executionId: string;
  readonly status: 'SUCCESS' | 'FAILURE' | 'PENDING';
  readonly startedAt: string;
  readonly completedAt?: string;
  readonly duration?: number; // in milliseconds
  readonly payload?: any;
  readonly error?: string;
  readonly metadata?: Record<string, any>;
}
