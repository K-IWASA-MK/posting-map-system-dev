export interface ExecutionLifecycleState {
  readonly executionId: string;
  readonly pipelineId: string;
  readonly lifecycleState: string;
}
