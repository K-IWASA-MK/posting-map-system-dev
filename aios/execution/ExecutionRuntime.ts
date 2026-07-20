import { RuntimeExecutionRequest } from "./RuntimeExecutionRequest";
import { RuntimeExecutionResult } from "./RuntimeExecutionResult";

export interface ExecutionRuntime {
  createExecutionPlan(
    request: RuntimeExecutionRequest
  ): RuntimeExecutionResult;
}
