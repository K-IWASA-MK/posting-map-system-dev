import { AIOSEventBus } from '../../event/AIOSEventBus';
import { AIOSEvent } from '../../event/AIOSEvent';
import { IdentityRuntime } from '../IdentityRuntime';
import { CertificateStore } from './CertificateStore';
import { SignatureVerifier } from './SignatureVerifier';
import { TrustEvaluator } from './TrustEvaluator';
import { DigitalIdentity, TrustEvidence, TrustPolicy, TrustRecord, CertificateStatus } from '../IdentityModels';
import { RuntimeState } from '../../runtime/RuntimeState';

export class TrustEngine {
  private readonly certStore = new CertificateStore();
  private readonly signatureVerifier = new SignatureVerifier();
  private readonly evaluator = new TrustEvaluator();
  private evidenceMap = new Map<string, TrustEvidence[]>();
  private verificationHistory = new Map<string, number>(); // identityId -> timestamp

  private activePolicy: TrustPolicy = {
    policyId: 'POL-TRUST-DEFAULT',
    weights: {
      SignatureVerification: 1.0,
      ComplianceEngine: 0.8,
      SecurityRuntime: 0.9,
      QualityRuntime: 0.5,
      ObservabilityRuntime: 0.4
    },
    thresholds: {
      minPassingScore: 70
    },
    decayModel: {
      decayRatePerHour: 2.0 // loses 2 points per hour
    }
  };

  constructor(
    private readonly eventBus: AIOSEventBus,
    private readonly identityRuntime: IdentityRuntime
  ) {}

  public getCertificateStore(): CertificateStore {
    return this.certStore;
  }

  public getSignatureVerifier(): SignatureVerifier {
    return this.signatureVerifier;
  }

  public setPolicy(policy: TrustPolicy): void {
    this.activePolicy = policy;
  }

  public async addEvidence(evidence: TrustEvidence): Promise<void> {
    const list = this.evidenceMap.get(evidence.identityId) || [];
    list.push(evidence);
    this.evidenceMap.set(evidence.identityId, list);

    await this.publishEvent('TrustEvidenceCollected', {
      identityId: evidence.identityId,
      evidenceId: evidence.evidenceId,
      source: evidence.source,
      state: RuntimeState.RUNNING
    });
  }

  public async verifySignature(
    identityId: string,
    data: string,
    signature: string
  ): Promise<boolean> {
    const identity = this.identityRuntime.getRegistry().getIdentity(identityId);
    if (!identity || identity.status === 'REVOKED' || identity.status === 'SUSPENDED') {
      return false;
    }

    // Verify certificate validity status
    const certStatus = this.certStore.verifyValidity(identity.certificateId);
    if (certStatus === 'REVOKED' || certStatus === 'EXPIRED') {
      return false;
    }

    const verified = this.signatureVerifier.verifySignature(data, signature, identity.publicKey);
    
    // Add verification time to update decay lastVerifiedAt
    if (verified) {
      this.verificationHistory.set(identityId, Date.now());
    }

    await this.publishEvent('SignatureVerified', {
      identityId,
      verified,
      state: RuntimeState.RUNNING
    });

    // Record dynamic evidence
    await this.addEvidence({
      evidenceId: `EVI-SIG-${Date.now()}`,
      identityId,
      source: 'SignatureVerification',
      category: 'cryptographic_signature',
      score: verified ? 100 : 0,
      weight: 1.0,
      timestamp: new Date().toISOString()
    });

    return verified;
  }

  public async evaluateTrust(identityId: string): Promise<TrustRecord> {
    const identity = this.identityRuntime.getRegistry().getIdentity(identityId);
    if (!identity) {
      throw new Error(`Identity ${identityId} not found`);
    }

    const lastVerified = this.verificationHistory.get(identityId) || identity.createdAt ? new Date(identity.createdAt).getTime() : Date.now();
    const evidences = this.evidenceMap.get(identityId) || [];

    const trustScore = this.evaluator.calculateScore(evidences, this.activePolicy, lastVerified);
    const certStatus = this.certStore.verifyValidity(identity.certificateId);
    
    const verificationStatus = (identity.status === 'VERIFIED' && certStatus === 'ACTIVE' && trustScore >= this.activePolicy.thresholds.minPassingScore) ? 'VERIFIED' : 'FAILED';

    const record: TrustRecord = {
      identityId,
      trustScore,
      verificationStatus,
      certificateStatus: certStatus,
      lastVerifiedAt: new Date(lastVerified).toISOString()
    };

    await this.publishEvent('TrustEvaluated', {
      identityId,
      trustScore,
      verificationStatus,
      state: RuntimeState.RUNNING
    });

    await this.publishEvent('TrustUpdated', {
      identityId,
      trustScore,
      state: RuntimeState.RUNNING
    });

    return record;
  }

  private async publishEvent(eventType: string, payload: any): Promise<void> {
    const event: AIOSEvent = {
      eventId: `EVT-TR-${eventType.toUpperCase()}-${Date.now()}`,
      eventType,
      eventVersion: '1.0',
      occurredAt: new Date().toISOString(),
      producerRuntimeId: 'aios.trust-engine',
      correlationId: `COR-TR-${Date.now()}`,
      causationId: `CAU-TR-${Date.now()}`,
      payload,
      runtimeId: 'aios.trust-engine',
      timestamp: new Date().toISOString(),
      state: payload.state
    };
    await this.eventBus.publish(event);
  }
}
