import { PlanningType } from "./PlanningType";
import { PlanningStatus } from "./PlanningStatus";
import { PlanStep } from "./PlanStep";

export interface ExecutionPlan {
  planId: string;
  name: string;
  type: PlanningType;
  status: PlanningStatus;
  steps: PlanStep[];
  dependencies: Record<string, string[]>;
  metadata: Record<string, any>;
}
