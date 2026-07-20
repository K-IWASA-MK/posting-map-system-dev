import { ExecutionResultResponse } from "./ExecutionResultResponse";

export interface RuntimeMetricsRequest {
  readonly executionResult: ExecutionResultResponse;
}
