import { IGovernanceRule } from './IGovernanceRule';

export class KnowledgeRuleRegistry {
  private readonly rules = new Map<string, IGovernanceRule>();

  public register(rule: IGovernanceRule): void {
    if (this.rules.has(rule.ruleId)) {
      throw new Error(`GovernanceRule ${rule.ruleId} is already registered`);
    }
    this.rules.set(rule.ruleId, rule);
  }

  public getAllRules(): IGovernanceRule[] {
    return Array.from(this.rules.values());
  }

  public count(): number {
    return this.rules.size;
  }

  public listIds(): ReadonlyArray<string> {
    return Object.freeze(Array.from(this.rules.keys()));
  }
}
