import { DigitalIdentity, IdentityNamespace, IdentityStatus } from './IdentityModels';

export class IdentityRegistry {
  private identities = new Map<string, DigitalIdentity>();

  public registerIdentity(identity: DigitalIdentity): void {
    this.identities.set(identity.identityId, identity);
  }

  public getIdentity(identityId: string): DigitalIdentity | undefined {
    return this.identities.get(identityId);
  }

  public getIdentityBySubject(namespace: IdentityNamespace, subjectId: string): DigitalIdentity | undefined {
    return Array.from(this.identities.values()).find(
      id => id.namespace === namespace && id.subjectId === subjectId
    );
  }

  public updateStatus(identityId: string, status: IdentityStatus): void {
    const id = this.identities.get(identityId);
    if (id) {
      this.identities.set(identityId, {
        ...id,
        status,
        updatedAt: new Date().toISOString()
      });
    }
  }

  public getAll(): DigitalIdentity[] {
    return Array.from(this.identities.values());
  }
}
