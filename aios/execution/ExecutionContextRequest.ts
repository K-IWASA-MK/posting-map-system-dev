import { OrchestrationPlan } from "./OrchestrationPlan";

export interface ExecutionContextRequest {
  readonly orchestrationPlan: OrchestrationPlan;
}
