import { FederationDomainProfile, FederationPolicyVersion } from './FederationModels';

export class FederationPolicyResolver {
  private activePolicies = new Map<string, FederationPolicyVersion>();

  public registerPolicy(policy: FederationPolicyVersion): void {
    this.activePolicies.set(policy.policyId, policy);
  }

  public getPolicy(policyId: string): FederationPolicyVersion | undefined {
    return this.activePolicies.get(policyId);
  }

  public validateDomainAccess(profile: FederationDomainProfile, policyId: string): boolean {
    const policy = this.activePolicies.get(policyId);
    if (!policy) return true; // Default allow if policy not found

    // Verify blacklist checks (e.g. LOW trustLevel domains are denied under strict policy)
    if (policyId === 'POL-FED-STRICT' && profile.trustLevel === 'LOW') {
      return false;
    }

    return true;
  }
}
