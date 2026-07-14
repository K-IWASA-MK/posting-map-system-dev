import { HealingContext } from "./HealingContext";
import { HealingPlan } from "./HealingPlan";

export interface ISelfHealingEngine {
  detectIssues(context: HealingContext): Promise<HealingContext[]>;
  analyzeFailure(context: HealingContext): Promise<Record<string, any>>;
  generateHealingPlan(context: HealingContext): Promise<HealingPlan>;
  validateRecovery(plan: HealingPlan): Promise<boolean>;
}

export abstract class BaseSelfHealingEngine implements ISelfHealingEngine {
  abstract detectIssues(context: HealingContext): Promise<HealingContext[]>;
  abstract analyzeFailure(context: HealingContext): Promise<Record<string, any>>;
  abstract generateHealingPlan(context: HealingContext): Promise<HealingPlan>;
  abstract validateRecovery(plan: HealingPlan): Promise<boolean>;
}
