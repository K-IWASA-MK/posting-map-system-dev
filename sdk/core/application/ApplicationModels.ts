export interface ApplicationSignature {
  readonly applicationId: string;
  readonly manifestHash: string;
  readonly signature: string;
  readonly certificateId: string;
}

export interface ApplicationProfile {
  readonly profileId: string;
  readonly environment: 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';
  readonly configuration: Record<string, any>;
  readonly requiredCapabilities: string[];
}

export interface ProvisioningPlan {
  readonly planId: string;
  readonly applicationId: string;
  readonly requiredServices: string[];
  readonly requiredCapabilities: string[];
  readonly deploymentPolicy: string;
  readonly status: 'PLANNING' | 'VALIDATED' | 'COMPLETED' | 'FAILED';
}

export interface ApplicationDefinition {
  readonly applicationId: string;
  readonly name: string;
  readonly version: string;
  readonly workflows: string[];
  readonly services: string[];
  readonly configuration: Record<string, any>;
  readonly status: 'ACTIVE' | 'INACTIVE';
}
