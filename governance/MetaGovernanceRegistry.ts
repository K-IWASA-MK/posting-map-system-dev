import { MetaGovernancePolicy } from "./MetaGovernancePolicy";

export class MetaGovernanceRegistry {
  private policies: Map<string, MetaGovernancePolicy> = new Map();

  public async addPolicy(policy: MetaGovernancePolicy): Promise<boolean> {
    if (this.policies.has(policy.policyId)) {
      return false;
    }
    this.policies.set(policy.policyId, policy);
    return true;
  }

  public async findPolicy(id: string): Promise<MetaGovernancePolicy | null> {
    return this.policies.get(id) || null;
  }

  public async listPolicies(): Promise<MetaGovernancePolicy[]> {
    return Array.from(this.policies.values());
  }

  public async removePolicy(id: string): Promise<boolean> {
    return this.policies.delete(id);
  }
}
