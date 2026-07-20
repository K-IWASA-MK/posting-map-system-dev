import { OrchestrationRequest } from "./OrchestrationRequest";
import { OrchestrationResult } from "./OrchestrationResult";

export interface AgentOrchestrator {
  createOrchestrationPlan(
    request: OrchestrationRequest
  ): OrchestrationResult;
}
