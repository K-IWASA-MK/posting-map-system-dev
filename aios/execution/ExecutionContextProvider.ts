import { ExecutionContextRequest } from "./ExecutionContextRequest";
import { ExecutionContextResult } from "./ExecutionContextResult";

export interface ExecutionContextProvider {
  createExecutionContext(
    request: ExecutionContextRequest
  ): ExecutionContextResult;
}
