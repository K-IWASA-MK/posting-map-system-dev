import { Command, OSEvent } from '../models/protocol';
import { ExecutionContext, ExecutionAttempt, ExecutionPhase } from '../models/kernel';
import { IExecutionKernel, IWorker, IExecutionLedger } from '../models/runtime_ports';
import { RetryExecutor } from './kernel/RetryExecutor';
import { TimeoutExecutor, TimeoutError } from './kernel/TimeoutExecutor';
import { CancellationExecutor, CancellationError } from './kernel/CancellationExecutor';

/**
 * DefaultExecutionKernel
 * 
 * Stateless component that wraps a Worker's execution with Timeout, Retry, and Cancellation
 * safeguards. Maps the immutable ExecutionContext to a volatile ExecutionAttempt.
 */
export class DefaultExecutionKernel implements IExecutionKernel {
  
  constructor(private readonly ledger: IExecutionLedger) {}

  async execute(
    context: ExecutionContext,
    command: Command,
    worker: IWorker
  ): Promise<readonly OSEvent[]> {
    
    // We compose the execution from outside in:
    // 1. Retry (re-attempts the internal operation)
    // 2. Cancellation (aborts specific attempt and stops retry)
    // 3. Timeout (applies per attempt)

    return RetryExecutor.execute(context.maxRetries, async (attemptNumber) => {
        
      // Generate the Attempt object for this specific try
      const attempt: ExecutionAttempt = {
        executionId: context.executionId,
        attempt: attemptNumber,
        startedAt: new Date().toISOString(),
        timeoutAt: new Date(Date.now() + context.timeoutMs).toISOString()
      };

        const workerId = worker.workerId || 'unknown_worker';
        const recordBase = {
          executionId: context.executionId,
          attempt: attemptNumber,
          commandId: command.commandId,
          workerId: workerId
        };

        // 1. Write STARTED
        await this.ledger.append({
          ...recordBase,
          timestamp: new Date().toISOString(),
          phase: 'STARTED'
        });

        // 2. Execute with Cancellation and Timeout wrappers
        try {
          const events = await CancellationExecutor.execute(context.cancellationToken, () => {
            return TimeoutExecutor.execute(
              context.timeoutMs,
              () => worker.execute(command, attempt)
            );
          });

          // 3. Write COMPLETED
          await this.ledger.append({
            ...recordBase,
            timestamp: new Date().toISOString(),
            phase: 'COMPLETED'
          });

          return events;

        } catch (error) {
          // 4. Write Failure Phase (TIMEOUT, CANCELLED, FAILED)
          let phase: ExecutionPhase = 'FAILED';
          if (error instanceof TimeoutError) {
            phase = 'TIMEOUT';
          } else if (error instanceof CancellationError) {
            phase = 'CANCELLED';
          }

          await this.ledger.append({
            ...recordBase,
            timestamp: new Date().toISOString(),
            phase: phase
          });

          throw error;
        }
    });
  }
}
