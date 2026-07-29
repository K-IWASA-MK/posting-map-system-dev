import { RuntimeExecutor } from '../RuntimeExecutor';
import { ExecutionContext } from '../ExecutionContext';
import { ExecutionResult } from '../ExecutionResult';

/**
 * NativeRuntime.ts
 * 
 * Stub implementation for the AIOS Native Runtime.
 */
export class NativeRuntime implements RuntimeExecutor {
  public readonly priority = 50; // Lower than Legacy

  supports(context: ExecutionContext): boolean {
    return context.decision.runtimeType === 'NATIVE_RUNTIME';
  }

  async execute(context: ExecutionContext): Promise<ExecutionResult> {
    const startedAt = new Date().toISOString();
    const startMs = Date.now();

    try {
      if (!this.supports(context)) {
        throw new Error('[NativeRuntime] Unsupported context execution attempt.');
      }

      const payload = {
        message: 'Native Runtime Stub Execution Successful'
      };

      const completedAt = new Date().toISOString();
      return Object.freeze({
        taskId: context.taskId,
        executionId: context.executionId,
        status: 'SUCCESS',
        startedAt,
        completedAt,
        duration: Date.now() - startMs,
        payload
      });
    } catch (err: any) {
      const completedAt = new Date().toISOString();
      return Object.freeze({
        taskId: context.taskId,
        executionId: context.executionId,
        status: 'FAILURE',
        startedAt,
        completedAt,
        duration: Date.now() - startMs,
        error: err.message || 'Unknown Native Runtime Error',
      });
    }
  }
}
