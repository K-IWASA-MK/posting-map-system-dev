import { RuntimeExecutor } from '../RuntimeExecutor';
import { ExecutionContext } from '../ExecutionContext';
import { ExecutionResult } from '../ExecutionResult';

/**
 * LegacyRuntime.ts
 * 
 * Execution Runtime for Legacy POSTING MAP Handlers.
 * Routes matching contexts to synchronous API calls via the LegacyContractAdapter (Stubbed for Foundation).
 */
export class LegacyRuntime implements RuntimeExecutor {
  public readonly priority = 100;

  supports(context: ExecutionContext): boolean {
    return context.decision.runtimeType === 'LEGACY_RUNTIME';
  }

  async execute(context: ExecutionContext): Promise<ExecutionResult> {
    const startedAt = new Date().toISOString();
    const startMs = Date.now();

    try {
      if (!this.supports(context)) {
        throw new Error('[LegacyRuntime] Unsupported context execution attempt.');
      }

      // TODO: Actual adapter mapping and Legacy Handler call would happen here.
      // For foundation layer, we simulate successful execution wrapper.
      
      const payload = {
        message: 'Legacy Runtime Stub Execution Successful',
        executedLegacyOperation: context.metadata.legacyOperation
      };

      const completedAt = new Date().toISOString();
      return Object.freeze({
        taskId: context.taskId,
        executionId: context.executionId,
        status: 'SUCCESS',
        startedAt,
        completedAt,
        duration: Date.now() - startMs,
        payload,
        metadata: {
          adapterUsed: context.decision.adapterType
        }
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
        error: err.message || 'Unknown Legacy Runtime Error',
      });
    }
  }
}
