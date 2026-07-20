import { OrchestrationPlan } from "./OrchestrationPlan";
import { ExecutionContextState } from "./ExecutionContextState";

export interface ExecutionPipelineRequest {
  readonly orchestrationPlan: OrchestrationPlan;
  readonly context: ExecutionContextState;
}
