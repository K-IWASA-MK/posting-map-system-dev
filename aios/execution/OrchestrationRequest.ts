import { ExecutionPlan } from "./ExecutionPlan";

export interface OrchestrationRequest {
  readonly executionPlan: ExecutionPlan;
}
