import { ExecutionPlan } from "./ExecutionPlan";

export class PlanningRegistry {
  private plans: Map<string, ExecutionPlan> = new Map();

  public async addPlan(plan: ExecutionPlan): Promise<boolean> {
    if (this.plans.has(plan.planId)) {
      return false;
    }
    this.plans.set(plan.planId, plan);
    return true;
  }

  public async findPlan(id: string): Promise<ExecutionPlan | null> {
    return this.plans.get(id) || null;
  }

  public async listPlans(): Promise<ExecutionPlan[]> {
    return Array.from(this.plans.values());
  }

  public async removePlan(id: string): Promise<boolean> {
    return this.plans.delete(id);
  }
}
