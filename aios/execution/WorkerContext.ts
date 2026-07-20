export interface WorkerContext {
  readonly workerId: string;
  readonly runtimeId: string;
  readonly sessionId: string;
}
