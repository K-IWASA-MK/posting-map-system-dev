export interface WorkerRequest {
  readonly requestId: string;
  readonly workerId: string;
  readonly executionId: string;
}
