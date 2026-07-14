import { HealingContext } from "./HealingContext";

export class HealingRegistry {
  private issues: Map<string, HealingContext> = new Map();

  public async addIssue(context: HealingContext): Promise<boolean> {
    if (this.issues.has(context.healingId)) {
      return false;
    }
    this.issues.set(context.healingId, context);
    return true;
  }

  public async findIssue(id: string): Promise<HealingContext | null> {
    return this.issues.get(id) || null;
  }

  public async listIssues(): Promise<HealingContext[]> {
    return Array.from(this.issues.values());
  }

  public async removeIssue(id: string): Promise<boolean> {
    return this.issues.delete(id);
  }
}
