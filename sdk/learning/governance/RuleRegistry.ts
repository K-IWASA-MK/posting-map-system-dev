import { IGovernanceRule } from './IGovernanceRule';

export class RuleRegistry {
  private readonly rules = new Map<string, IGovernanceRule>();

  public register(rule: IGovernanceRule): void {
    if (this.rules.has(rule.ruleId)) {
      throw new Error(`Rule ${rule.ruleId} is already registered.`);
    }
    this.rules.set(rule.ruleId, rule);
  }

  public getRule(ruleId: string): IGovernanceRule {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      throw new Error(`Rule ${ruleId} not found.`);
    }
    return rule;
  }

  public getAllRules(): ReadonlyArray<IGovernanceRule> {
    return Array.from(this.rules.values());
  }
}
