export type FederationDomainType = 'AIOS' | 'CLOUD' | 'SaaS' | 'INTERNAL' | 'PARTNER';

export type FederationSessionStatus = 'CREATED' | 'AUTHENTICATED' | 'ESTABLISHED' | 'SUSPENDED' | 'TERMINATED';

export type IdentityMappingType = '1:1' | 'AttributeBased' | 'GroupBased' | 'NamespaceTranslation';

export interface FederationDomainProfile {
  readonly domainId: string;
  readonly domainType: FederationDomainType;
  readonly protocol: string;
  readonly trustLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  readonly supportedCapabilities: string[];
}

export interface FederationSession {
  readonly sessionId: string;
  readonly domainId: string;
  readonly status: FederationSessionStatus;
  readonly expiresAt: number;
  readonly establishedAt: number;
  readonly mutualAuthStatus: 'PENDING' | 'ESTABLISHED';
}

export interface IdentityMappingPolicy {
  readonly policyId: string;
  readonly mappingType: IdentityMappingType;
  readonly priority: number;
  readonly conditions: string[];
}

export interface FederationIdentity {
  readonly domainId: string;
  readonly remoteIdentityId: string;
  readonly mappedIdentityId: string;
  readonly certificateId: string;
  readonly trustScore: number;
  readonly status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
}

export interface FederationTrustEvidence {
  readonly evidenceId: string;
  readonly domainId: string;
  readonly source: string;
  readonly verificationType: string;
  readonly score: number;
  readonly timestamp: string;
}

export interface FederationPolicyVersion {
  readonly policyId: string;
  readonly version: string;
  readonly effectiveFrom: string;
  readonly checksum: string;
}
