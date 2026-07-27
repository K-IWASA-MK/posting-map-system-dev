/**
 * DeploymentTargetGateTypes.ts
 * 
 * Deployment Target Verification Gate (DTVG) で使用する型定義および契約定義。
 * AIOS Release Infrastructure (Foundation Layer)
 */

export type EnvironmentPolicy = 'production' | 'staging' | 'development';

export type VerificationStatus = 'PASS' | 'FAIL' | 'WARNING';

export type GateId = 
  | 'Gate-001' // Repository Match
  | 'Gate-002' // Branch Match
  | 'Gate-003' // Publish Root Match
  | 'Gate-004' // Runtime Config Match
  | 'Gate-005' // AI Employee Authorization
  | 'Gate-006' // Audit Recorded
  | 'Gate-007'; // Deployment Fingerprint Match

export interface GateResult {
  gateId: GateId;
  name: string;
  status: VerificationStatus;
  detail: string;
  timestamp: number;
}

export interface DeploymentFingerprint {
  repositorySha: string;
  buildHash: string;
  deploymentId: string;
  runtimeConfigHash: string;
  fingerprintHash: string;
}

export interface DeploymentGateRequest {
  releaseId: string;
  version: string;
  environment: EnvironmentPolicy;
  requestedRepository: string;
  requestedBranch: string;
  targetPublishRoot: string;
  frontendConfigPath: string;
  expectedBackendEndpoint: string;
  expectedBackendVersion: string;
  employeeId: string;
  profileName: string;
  fingerprint?: Partial<DeploymentFingerprint>;
}

export interface DeploymentGateResult {
  releaseId: string;
  version: string;
  environment: EnvironmentPolicy;
  overallStatus: VerificationStatus;
  gateResults: GateResult[];
  fingerprint: DeploymentFingerprint;
  ledgerId?: string;
  evaluatedAt: string;
}

export interface DryRunResult {
  request: DeploymentGateRequest;
  simulatedResult: DeploymentGateResult;
  publishSummary: {
    repository: string;
    branch: string;
    targetPublishRoot: string;
    backendEndpoint: string;
    employeeId: string;
  };
}
