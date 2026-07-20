import { ExecutionLifecycleRequest } from "./ExecutionLifecycleRequest";
import { ExecutionLifecycleResponse } from "./ExecutionLifecycleResponse";

export interface ExecutionLifecycleProvider {
  createExecutionLifecycle(
    request: ExecutionLifecycleRequest
  ): ExecutionLifecycleResponse;
}
