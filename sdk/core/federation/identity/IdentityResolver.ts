import { IdentityMapper } from './IdentityMapper';
import { DomainIdentityRegistry } from './DomainIdentityRegistry';
import { RemoteIdentity } from './RemoteIdentity';
import { FederationIdentity } from '../FederationModels';
import { IdentityRuntime } from '../../identity/IdentityRuntime';

export class IdentityResolver {
  private readonly mapper = new IdentityMapper();
  private readonly registry = new DomainIdentityRegistry();

  constructor(private readonly identityRuntime: IdentityRuntime) {}

  public getMapper(): IdentityMapper {
    return this.mapper;
  }

  public getRegistry(): DomainIdentityRegistry {
    return this.registry;
  }

  public async resolveRemoteIdentity(remote: RemoteIdentity): Promise<FederationIdentity> {
    const existing = this.registry.getMapping(remote.domainId, remote.remoteId);
    if (existing) {
      return existing;
    }

    const mappedIdentityId = this.mapper.mapIdentity(remote);
    
    // Register the mapped identity locally in the IdentityRuntime namespace
    const certId = `CERT-FED-${Date.now()}`;
    
    // Auto-create local DigitalIdentity record
    this.identityRuntime.getRegistry().registerIdentity({
      identityId: mappedIdentityId,
      namespace: 'USER',
      subjectType: 'APPLICATION',
      subjectId: remote.remoteId,
      publicKey: 'PUB-KEY-FED-DEF',
      certificateId: certId,
      status: 'VERIFIED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const mapping: FederationIdentity = {
      domainId: remote.domainId,
      remoteIdentityId: remote.remoteId,
      mappedIdentityId,
      certificateId: certId,
      trustScore: 100, // default trust score
      status: 'ACTIVE'
    };

    this.registry.registerMapping(mapping);

    await this.identityRuntime.publishEvent('IdentityMapped', {
      domainId: remote.domainId,
      remoteIdentityId: remote.remoteId,
      mappedIdentityId,
      state: 'RUNNING'
    });

    return mapping;
  }
}
