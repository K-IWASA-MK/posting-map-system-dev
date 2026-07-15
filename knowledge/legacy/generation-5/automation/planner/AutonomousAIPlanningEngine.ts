import { ExecutionPlan } from "./ExecutionPlan";
import { PlanningContext } from "./PlanningContext";

export interface IAutonomousAIPlanningEngine {
  generatePlan(context: PlanningContext): Promise<ExecutionPlan>;
  validatePlan(plan: ExecutionPlan, context: PlanningContext): Promise<boolean>;
  optimizePlan(plan: ExecutionPlan): Promise<ExecutionPlan>;
  resolveDependencies(plan: ExecutionPlan): Promise<Record<string, string[]>>;
}

export abstract class BaseAutonomousAIPlanningEngine implements IAutonomousAIPlanningEngine {
  abstract generatePlan(context: PlanningContext): Promise<ExecutionPlan>;
  abstract validatePlan(plan: ExecutionPlan, context: PlanningContext): Promise<boolean>;
  abstract optimizePlan(plan: ExecutionPlan): Promise<ExecutionPlan>;
  abstract resolveDependencies(plan: ExecutionPlan): Promise<Record<string, string[]>>;
}
