import { PolicyDefinition, PolicyScope } from '../GovernanceModels';

export class ComplianceEvaluator {
  private readonly scopeHierarchy: PolicyScope[] = ['GLOBAL', 'RUNTIME', 'PLUGIN', 'APPLICATION'];

  public getApplicablePolicies(policies: PolicyDefinition[], targetScope: PolicyScope): PolicyDefinition[] {
    const targetIdx = this.scopeHierarchy.indexOf(targetScope);
    if (targetIdx === -1) return [];

    // Inheritance rule: targetScope inherits GLOBAL and all parent levels in hierarchy (index <= targetIdx)
    const applicable = policies.filter(p => {
      const idx = this.scopeHierarchy.indexOf(p.scope);
      return idx !== -1 && idx <= targetIdx && p.state === 'ACTIVE';
    });

    // Sort by scope inheritance depth (GLOBAL first) then priority (priority 1 > 3)
    return applicable.sort((a, b) => {
      const scopeDiff = this.scopeHierarchy.indexOf(a.scope) - this.scopeHierarchy.indexOf(b.scope);
      return scopeDiff || a.priority - b.priority;
    });
  }
}
