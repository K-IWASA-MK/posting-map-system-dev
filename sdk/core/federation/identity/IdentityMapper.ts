import { RemoteIdentity } from './RemoteIdentity';
import { IdentityMappingPolicy } from '../FederationModels';

export class IdentityMapper {
  private activePolicy: IdentityMappingPolicy = {
    policyId: 'POL-MAP-DEFAULT',
    mappingType: 'NamespaceTranslation',
    priority: 1,
    conditions: []
  };

  public setPolicy(policy: IdentityMappingPolicy): void {
    this.activePolicy = policy;
  }

  public mapIdentity(remote: RemoteIdentity): string {
    const type = this.activePolicy.mappingType;

    if (type === '1:1') {
      // 1:1 mapping mapping condition check
      if (remote.remoteId === 'admin-remote') {
        return 'ID-SYSTEM-admin-local';
      }
      return `ID-PARTNER-${remote.remoteId}`;
    }

    if (type === 'NamespaceTranslation') {
      // NamespaceTranslation translates ID with domain prefix
      return `ID-USER-${remote.domainId}:${remote.remoteId}`;
    }

    // Default translation fallback
    return `ID-FED-${remote.domainId}-${remote.remoteId}`;
  }
}
