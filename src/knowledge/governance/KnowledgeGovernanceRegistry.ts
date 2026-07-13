import { IGovernancePolicy } from './IGovernancePolicy';

export class KnowledgeGovernanceRegistry {
  private readonly policies = new Map<string, IGovernancePolicy>();

  public register(policy: IGovernancePolicy): void {
    if (this.policies.has(policy.targetPluginId)) {
      throw new Error(`GovernancePolicy for plugin ${policy.targetPluginId} already registered`);
    }
    this.policies.set(policy.targetPluginId, policy);
  }

  public getPolicy(pluginId: string): IGovernancePolicy | undefined {
    return this.policies.get(pluginId);
  }
}
