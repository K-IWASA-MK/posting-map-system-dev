import { OptimizationContext } from "./OptimizationContext";
import { OptimizationPlan } from "./OptimizationPlan";

export interface IAutonomousOptimizationEngine {
  analyzeSystem(context: OptimizationContext): Promise<Record<string, any>>;
  generateOptimizationPlan(context: OptimizationContext): Promise<OptimizationPlan>;
  validateOptimization(plan: OptimizationPlan): Promise<boolean>;
  simulateImpact(plan: OptimizationPlan): Promise<Record<string, any>>;
}

export abstract class BaseAutonomousOptimizationEngine implements IAutonomousOptimizationEngine {
  abstract analyzeSystem(context: OptimizationContext): Promise<Record<string, any>>;
  abstract generateOptimizationPlan(context: OptimizationContext): Promise<OptimizationPlan>;
  abstract validateOptimization(plan: OptimizationPlan): Promise<boolean>;
  abstract simulateImpact(plan: OptimizationPlan): Promise<Record<string, any>>;
}
