import { AIOSEventBus } from '../../event/AIOSEventBus';
import { FederationRuntime } from '../FederationRuntime';
import { CertificateExchange } from './CertificateExchange';
import { RemoteTrustEvaluator } from './RemoteTrustEvaluator';
import { DomainTrustRegistry } from './DomainTrustRegistry';
import { FederationDomainProfile, FederationTrustEvidence } from '../FederationModels';
import { IdentityRuntime } from '../../identity/IdentityRuntime';
import { RuntimeState } from '../../runtime/RuntimeState';

export class FederationTrustEngine {
  private readonly certExchange: CertificateExchange;
  private readonly evaluator = new RemoteTrustEvaluator();
  private readonly registry = new DomainTrustRegistry();

  constructor(
    private readonly eventBus: AIOSEventBus,
    private readonly federationRuntime: FederationRuntime,
    private readonly identityRuntime: IdentityRuntime
  ) {
    this.certExchange = new CertificateExchange(identityRuntime);
  }

  public getRegistry(): DomainTrustRegistry {
    return this.registry;
  }

  public async exchangeCertificate(profile: FederationDomainProfile): Promise<string> {
    const certId = await this.certExchange.exchangeCertificate(profile);
    return certId;
  }

  public async addDomainEvidence(evidence: FederationTrustEvidence): Promise<void> {
    this.registry.addEvidence(evidence);
    
    // Recalculate and update cached score
    const evidences = this.registry.getEvidence(evidence.domainId);
    const score = this.evaluator.calculateRemoteScore(evidences);
    this.registry.cacheScore(evidence.domainId, score);

    await this.federationRuntime.publishEvent('FederationTrustUpdated', {
      domainId: evidence.domainId,
      trustScore: score,
      state: RuntimeState.RUNNING
    });
  }

  public async evaluateDomainTrust(domainId: string): Promise<number> {
    const cached = this.registry.getCachedScore(domainId);
    if (cached !== undefined) {
      return cached;
    }

    const evidences = this.registry.getEvidence(domainId);
    const score = this.evaluator.calculateRemoteScore(evidences);
    this.registry.cacheScore(domainId, score);

    await this.federationRuntime.publishEvent('RemoteTrustEvaluated', {
      domainId,
      trustScore: score,
      state: RuntimeState.RUNNING
    });

    return score;
  }

  public async verifyRemoteIdentity(domainId: string, remoteIdentityId: string): Promise<boolean> {
    const score = await this.evaluateDomainTrust(domainId);
    const passed = score >= 70; // Trust threshold limit

    await this.federationRuntime.publishEvent('RemoteIdentityVerified', {
      domainId,
      remoteIdentityId,
      verified: passed,
      state: RuntimeState.RUNNING
    });

    return passed;
  }
}
