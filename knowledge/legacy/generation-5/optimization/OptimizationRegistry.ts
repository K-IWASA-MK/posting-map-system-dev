import { OptimizationPlan } from "./OptimizationPlan";

export class OptimizationRegistry {
  private plans: Map<string, OptimizationPlan> = new Map();

  public async addPlan(plan: OptimizationPlan): Promise<boolean> {
    if (this.plans.has(plan.planId)) {
      return false;
    }
    this.plans.set(plan.planId, plan);
    return true;
  }

  public async findPlan(id: string): Promise<OptimizationPlan | null> {
    return this.plans.get(id) || null;
  }

  public async listPlans(): Promise<OptimizationPlan[]> {
    return Array.from(this.plans.values());
  }

  public async removePlan(id: string): Promise<boolean> {
    return this.plans.delete(id);
  }
}
