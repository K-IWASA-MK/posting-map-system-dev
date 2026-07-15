import { ExecutionRequest, ExecutionPlan, ExecutionToken, ExecutionResult } from './models';

export interface IRuntimeScheduler {
  enqueue(plan: ExecutionPlan, request: ExecutionRequest): Promise<ExecutionToken>;
  schedule(token: ExecutionToken, plan: ExecutionPlan, request: ExecutionRequest): Promise<ExecutionResult>;
  cancel(token: ExecutionToken): Promise<void>;
}
