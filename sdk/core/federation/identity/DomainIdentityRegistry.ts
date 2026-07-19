import { FederationIdentity } from '../FederationModels';

export class DomainIdentityRegistry {
  private mappings = new Map<string, FederationIdentity>();

  public registerMapping(mapping: FederationIdentity): void {
    const key = `${mapping.domainId}:${mapping.remoteIdentityId}`;
    this.mappings.set(key, mapping);
  }

  public getMapping(domainId: string, remoteIdentityId: string): FederationIdentity | undefined {
    const key = `${domainId}:${remoteIdentityId}`;
    return this.mappings.get(key);
  }

  public getMappingByLocalId(mappedIdentityId: string): FederationIdentity | undefined {
    return Array.from(this.mappings.values()).find(
      m => m.mappedIdentityId === mappedIdentityId
    );
  }

  public revokeMapping(domainId: string, remoteIdentityId: string): void {
    const key = `${domainId}:${remoteIdentityId}`;
    const m = this.mappings.get(key);
    if (m) {
      this.mappings.set(key, {
        ...m,
        status: 'REVOKED'
      });
    }
  }

  public getAll(): FederationIdentity[] {
    return Array.from(this.mappings.values());
  }
}
