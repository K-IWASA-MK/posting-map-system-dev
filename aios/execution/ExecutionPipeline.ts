import { ExecutionPipelineRequest } from "./ExecutionPipelineRequest";
import { ExecutionPipelineResult } from "./ExecutionPipelineResult";

export interface ExecutionPipeline {
  createPipelinePlan(
    request: ExecutionPipelineRequest
  ): ExecutionPipelineResult;
}
