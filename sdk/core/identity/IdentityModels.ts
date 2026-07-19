export type IdentityNamespace = 'SYSTEM' | 'RUNTIME' | 'PLUGIN' | 'AGENT' | 'APPLICATION' | 'USER';

export type IdentityStatus = 'REGISTERED' | 'VERIFIED' | 'SUSPENDED' | 'REVOKED';

export type CertificateStatus = 'ISSUED' | 'ACTIVE' | 'SUSPENDED' | 'REVOKED' | 'EXPIRED';

export interface DigitalIdentity {
  readonly identityId: string;
  readonly namespace: IdentityNamespace;
  readonly subjectType: 'RUNTIME' | 'PLUGIN' | 'AGENT' | 'APPLICATION';
  readonly subjectId: string;
  readonly publicKey: string;
  readonly certificateId: string;
  readonly status: IdentityStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface Certificate {
  readonly certificateId: string;
  readonly identityId: string;
  readonly publicKey: string;
  readonly status: CertificateStatus;
  readonly issuedAt: number;
  readonly expiresAt: number;
  readonly revokedAt?: number;
}

export interface TrustEvidence {
  readonly evidenceId: string;
  readonly identityId: string;
  readonly source: 'SignatureVerification' | 'ComplianceEngine' | 'SecurityRuntime' | 'QualityRuntime' | 'ObservabilityRuntime';
  readonly category: string;
  readonly score: number;
  readonly weight: number;
  readonly timestamp: string;
}

export interface TrustPolicy {
  readonly policyId: string;
  readonly weights: Record<string, number>;
  readonly thresholds: {
    readonly minPassingScore: number;
  };
  readonly decayModel: {
    readonly decayRatePerHour: number;
  };
}

export interface TrustRecord {
  readonly identityId: string;
  readonly trustScore: number;
  readonly verificationStatus: 'VERIFIED' | 'FAILED';
  readonly certificateStatus: CertificateStatus;
  readonly lastVerifiedAt: string;
}
