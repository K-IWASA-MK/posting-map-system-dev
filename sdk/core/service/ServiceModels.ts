export type LicenseState = 'ISSUED' | 'ACTIVE' | 'SUSPENDED' | 'REVOKED' | 'EXPIRED';

export interface ServiceIdentity {
  readonly serviceId: string;
  readonly publisherId: string;
  readonly manifestHash: string;
  readonly signature: string;
  readonly certificateId: string;
  readonly trustScore: number;
  readonly status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
}

export interface ServiceDependency {
  readonly serviceId: string;
  readonly dependsOn: string;
  readonly versionConstraint: string;
  readonly requiredCapabilities: string[];
}

export interface MarketplaceReview {
  readonly reviewId: string;
  readonly serviceId: string;
  readonly reviewerId: string;
  readonly qualityScore: number;
  readonly trustScore: number;
  readonly timestamp: string;
}

export interface LicenseRecord {
  readonly licenseId: string;
  readonly serviceId: string;
  readonly licenseeId: string;
  readonly status: LicenseState;
  readonly expiresAt: number;
}

export interface BillingProviderInfo {
  readonly providerId: string;
  readonly providerType: string;
  readonly status: 'ACTIVE' | 'INACTIVE';
  readonly supportedFeatures: string[];
}

export interface ServiceDefinition {
  readonly serviceId: string;
  readonly providerId: string;
  readonly version: string;
  readonly capabilities: string[];
  readonly licenseType: string;
  readonly billingModel: string;
  readonly status: 'ACTIVE' | 'INACTIVE';
}

export interface MarketplaceEntry {
  readonly entryId: string;
  readonly serviceId: string;
  readonly publisherId: string;
  readonly visibility: 'PUBLIC' | 'PRIVATE';
  readonly category: string;
  readonly rating: number;
  readonly status: 'PUBLISHED' | 'UNPUBLISHED';
}

export interface BillingTransaction {
  readonly txId: string;
  readonly serviceId: string;
  readonly providerId: string;
  readonly amount: number;
  readonly status: 'PAID' | 'FAILED';
}
