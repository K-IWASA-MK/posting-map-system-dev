import { RuntimeExecutor } from '../RuntimeExecutor';
import { ExecutionContext } from '../ExecutionContext';
import { ExecutionResult } from '../ExecutionResult';

/**
 * PluginRuntime.ts
 * 
 * Stub implementation for a future Plugin-based Execution Runtime.
 */
export class PluginRuntime implements RuntimeExecutor {
  public readonly priority = 80; // Below Legacy, above Native

  supports(context: ExecutionContext): boolean {
    return context.decision.runtimeType === 'PLUGIN_RUNTIME';
  }

  async execute(context: ExecutionContext): Promise<ExecutionResult> {
    const startedAt = new Date().toISOString();
    const startMs = Date.now();

    try {
      if (!this.supports(context)) {
        throw new Error('[PluginRuntime] Unsupported context execution attempt.');
      }

      const payload = {
        message: 'Plugin Runtime Stub Execution Successful'
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
        error: err.message || 'Unknown Plugin Runtime Error',
      });
    }
  }
}
