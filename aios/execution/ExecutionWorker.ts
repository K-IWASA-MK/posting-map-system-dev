import { WorkerRequest } from "./WorkerRequest";
import { WorkerResult } from "./WorkerResult";

export interface ExecutionWorker {
  execute(
    request: WorkerRequest
  ): WorkerResult;
}
