import { ExecutionResultState } from "./ExecutionResultState";
import { ExecutionResultSummary } from "./ExecutionResultSummary";

export interface ExecutionResultResponse {
  readonly result: ExecutionResultState;
  readonly summary: ExecutionResultSummary;
}
