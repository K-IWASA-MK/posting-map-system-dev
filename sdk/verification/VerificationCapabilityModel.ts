/**
 * VerificationCapabilityModel.ts
 * 
 * AIOS Verification Runtime Foundation - Capability Model Definitions
 * 
 * AI社員が実行環境（Browser, CDP, Git, Filesystem, API, GitHub Actions, Deployment, Asset Version等）の
 * 自己診断を行い、検証能力を正確に認識・管理するためのモデル定義。
 */

export enum VerificationCapabilityType {
  BROWSER_AUTOMATION = 'BROWSER_AUTOMATION',
  CDP_ENDPOINT = 'CDP_ENDPOINT',
  SCREENSHOT = 'SCREENSHOT',
  DOM_INSPECTION = 'DOM_INSPECTION',
  CONSOLE_CAPTURE = 'CONSOLE_CAPTURE',
  NETWORK_CAPTURE = 'NETWORK_CAPTURE',
  GIT_ACCESS = 'GIT_ACCESS',
  FILE_ACCESS = 'FILE_ACCESS',
  API_ACCESS = 'API_ACCESS',
  GITHUB_ACTION_STATUS = 'GITHUB_ACTION_STATUS',
  DEPLOYMENT_STATUS = 'DEPLOYMENT_STATUS',
  PRODUCTION_URL_ACCESS = 'PRODUCTION_URL_ACCESS',
  ASSET_VERSION_VERIFY = 'ASSET_VERSION_VERIFY'
}

export enum VerificationCapabilityStatus {
  AVAILABLE = 'AVAILABLE',
  UNAVAILABLE = 'UNAVAILABLE',
  DEGRADED = 'DEGRADED',
  UNTESTED = 'UNTESTED',
  DISABLED = 'DISABLED'
}

export interface VerificationCapability {
  readonly id: string;
  readonly type: VerificationCapabilityType;
  readonly status: VerificationCapabilityStatus;
  readonly endpoint?: string;
  readonly permission?: string;
  readonly lastChecked: string;
  readonly metadata?: Readonly<Record<string, any>>;
}

export type VerificationCapabilityOverallStatus = 'READY' | 'PARTIAL' | 'UNAVAILABLE';

export interface VerificationCapabilitySnapshot {
  readonly snapshotId: string;
  readonly timestamp: string;
  readonly capabilities: readonly VerificationCapability[];
  readonly overallStatus: VerificationCapabilityOverallStatus;
}
