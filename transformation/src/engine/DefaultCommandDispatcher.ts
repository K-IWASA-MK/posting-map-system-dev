import { ExecutionContext } from '../models/kernel';
import { AutomationJob, OSEvent } from '../models/protocol';
import { ICommandDispatcher, IWorkerProvider, IExecutionKernel } from '../models/runtime_ports';

/**
 * DefaultCommandDispatcher
 * 
 * Extracts the Command from the AutomationJob, delegates Worker resolution to the Provider,
 * builds the ExecutionContext, and delegates execution to the ExecutionKernel.
 */
export class DefaultCommandDispatcher implements ICommandDispatcher {
  
  constructor(
    private readonly provider: IWorkerProvider,
    private readonly kernel: IExecutionKernel
  ) {}

  async dispatch(job: AutomationJob): Promise<readonly OSEvent[]> {
    // 1. Extract the Command
    const command = job.command;

    // 2. Resolve the Worker via the Provider
    const worker = this.provider.get(command);

    // 3. Build ExecutionContext (In a real OS, this comes from PolicyResolver via policyRef)
    const context: ExecutionContext = {
      executionId: job.jobId,
      traceId: job.traceId,
      startedAt: new Date().toISOString(),
      timeoutMs: 5000, // Default timeout
      maxRetries: 3,   // Default retries
      remainingBudget: 100,
      trustLevel: 'INTERNAL',
      cancellationToken: {
        isCancellationRequested: false,
        onCancellationRequested: () => {}
      },
      metadata: {}
    };

    // 4. Delegate execution to Kernel
    return await this.kernel.execute(context, command, worker);
  }
}
