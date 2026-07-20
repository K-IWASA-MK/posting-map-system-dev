export interface ExecutionPipelinePlan {
  readonly pipelineId: string;
  readonly executionId: string;
  readonly stages: readonly string[];
}
