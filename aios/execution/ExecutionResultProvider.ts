import { ExecutionResultRequest } from "./ExecutionResultRequest";
import { ExecutionResultResponse } from "./ExecutionResultResponse";

export interface ExecutionResultProvider {
  createExecutionResult(
    request: ExecutionResultRequest
  ): ExecutionResultResponse;
}
