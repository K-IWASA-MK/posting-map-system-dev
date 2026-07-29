import { TaskContract } from '../gateway/models/TaskContractModels';
import { ExecutionDispatcher } from '../dispatcher/ExecutionDispatcher';
import { ExecutionRuntime } from '../runtime/ExecutionRuntime';
import { ExecutionResultAdapter } from '../results/ExecutionResultAdapter';
import { PipelineResult } from './PipelineResult';
import { PipelineOptions, DEFAULT_PIPELINE_OPTIONS } from './PipelineOptions';

/**
 * ExecutionPipeline.ts
 * 
 * Generation 10 End-to-End Orchestrator.
 * Purely connects the standard AIOS Foundations:
 * TaskContract -> Dispatcher -> Runtime -> ResultAdapter -> TaskResult
 */
export class ExecutionPipeline {
  constructor(
    private readonly dispatcher: typeof ExecutionDispatcher,
    private readonly runtime: ExecutionRuntime,
    private readonly resultAdapter: ExecutionResultAdapter
  ) {}

  /**
   * Executes the standard AIOS execution pipeline for a given TaskContract.
   * Throws exceptions directly, letting upper layers handle workflow retries.
   */
  public async execute(
    contract: TaskContract,
    options: PipelineOptions = DEFAULT_PIPELINE_OPTIONS
  ): Promise<PipelineResult> {
    const startMs = Date.now();

    // 1. Dispatch (Where to run)
    const dispatchResult = this.dispatcher.dispatch(contract);
    const decision = dispatchResult.decision;

    // 2. Execution (Run it)
    const execResult = await this.runtime.execute(decision, contract, {
      pipelineOptions: options
    });

    // 3. Adapter (Normalize result)
    const taskResult = this.resultAdapter.convert(execResult);

    // 4. Wrap in PipelineResult
    const completedAt = new Date();
    const executionTime = completedAt.getTime() - startMs;

    return Object.freeze({
      taskResult,
      executionTime,
      completedAt,
      metadata: Object.freeze({
        pipelineVersion: '10.0',
        correlationId: `CORR-${contract.taskId}-${startMs}`,
        stagesExecuted: ['DISPATCH', 'RUNTIME', 'RESULT_ADAPTER']
      })
    });
  }
}
