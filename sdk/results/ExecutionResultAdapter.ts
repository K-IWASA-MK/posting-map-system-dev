import { ResultAdapter } from './ResultAdapter';
import { ExecutionResult } from '../runtime/ExecutionResult';
import { TaskResult } from './TaskResult';
import { TaskStatus } from './TaskStatus';
import { ResultError } from './ResultError';
import { ResultMetadata } from './ResultMetadata';

/**
 * ExecutionResultAdapter.ts
 * 
 * Translates an ExecutionResult (from ExecutionRuntime) into a TaskResult (AIOS SSOT).
 * 
 * Rules:
 * - Pure translation layer. No business logic.
 * - Deterministic, Stateless, and Immutable.
 * - Extracts `taskId` directly from ExecutionResult.
 */
export class ExecutionResultAdapter implements ResultAdapter<ExecutionResult, TaskResult> {
  
  public supports(result: ExecutionResult): boolean {
    return !!result && !!result.taskId && !!result.executionId;
  }

  public convert(result: ExecutionResult): TaskResult {
    if (!this.supports(result)) {
      throw new Error('[ExecutionResultAdapter] Invalid ExecutionResult: missing taskId or executionId');
    }

    const status = this.mapStatus(result.status);
    const error = this.mapError(result.error);
    const metadata = this.mapMetadata(result.metadata);

    const startedAt = new Date(result.startedAt);
    const completedAt = result.completedAt ? new Date(result.completedAt) : new Date();
    const duration = result.duration ?? (completedAt.getTime() - startedAt.getTime());

    return Object.freeze({
      taskId: result.taskId,
      executionId: result.executionId,
      status,
      startedAt,
      completedAt,
      duration,
      payload: result.payload ? Object.freeze({ ...result.payload }) : undefined,
      error,
      metadata
    });
  }

  private mapStatus(status: 'SUCCESS' | 'FAILURE' | 'PENDING'): TaskStatus {
    switch (status) {
      case 'SUCCESS': return 'SUCCESS';
      case 'FAILURE': return 'FAILED';
      case 'PENDING': return 'TIMEOUT'; // Pending at this stage indicates it didn't complete normally
      default: return 'FAILED';
    }
  }

  private mapError(error?: string): ResultError | undefined {
    if (!error) return undefined;
    return Object.freeze({
      code: 'RUNTIME_EXECUTION_ERROR',
      message: error,
      retryable: false, // Defaulting to false, upper layers may determine based on error code
    });
  }

  private mapMetadata(meta?: Record<string, any>): ResultMetadata {
    if (!meta) return Object.freeze({});
    
    // Safely copy properties, ensuring no direct reference
    return Object.freeze({
      ...meta,
      version: meta.version || '1.0'
    });
  }
}
