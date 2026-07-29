import { TaskContract } from '../gateway/models/TaskContractModels';
import { DispatchDecision } from '../dispatcher/DispatchDecision';
import { PipelineOptions, DEFAULT_PIPELINE_OPTIONS } from './PipelineOptions';

/**
 * PipelineContext.ts
 * 
 * Immutable execution context shared across the entire Execution Pipeline.
 * Exposes all information needed for tracing, auditing, and execution
 * without holding any business logic state.
 */
export interface PipelineContext {
  readonly contract: TaskContract;
  readonly dispatchDecision?: DispatchDecision;
  readonly correlationId: string;
  readonly executionId: string;
  readonly options: PipelineOptions;
}

export class PipelineContextFactory {
  public static create(
    contract: TaskContract,
    options: PipelineOptions = DEFAULT_PIPELINE_OPTIONS,
    dispatchDecision?: DispatchDecision
  ): PipelineContext {
    return Object.freeze({
      contract: Object.freeze({ ...contract }),
      dispatchDecision: dispatchDecision ? Object.freeze({ ...dispatchDecision }) : undefined,
      correlationId: `CORR-${contract.taskId}-${Date.now()}`,
      executionId: `EXEC-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      options: Object.freeze({ ...options })
    });
  }
}
