import { PolicyRule } from "./PolicyRule";

export class PolicyRegistry {
  private rules: PolicyRule[] = [];

  public register(rule: PolicyRule): void {
    this.rules.push(rule);
  }

  public resolve(): PolicyRule[] {
    return [...this.rules];
  }

  public unregister(ruleId: string): void {
    this.rules = this.rules.filter(r => r.id !== ruleId);
  }

  public list(): PolicyRule[] {
    return [...this.rules];
  }
}
