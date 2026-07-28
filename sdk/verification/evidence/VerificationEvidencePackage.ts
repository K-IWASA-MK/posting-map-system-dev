/**
 * VerificationEvidencePackage.ts
 * 
 * AIOS Task Completion Evidence Package Model
 * 
 * タスク完了時の客観的・不変な完全証跡データコンテナ構造体
 */

import { BrowserVerificationResult } from '../browser/BrowserVerificationModels';
import { DeploymentVerificationResult } from '../deployment/DeploymentVerificationModels';
import { VerificationCapabilitySnapshot } from '../VerificationCapabilityModel';

export interface VerificationEvidencePackage {
  readonly verificationId: string;
  readonly taskId: string;
  readonly timestamp: string;
  readonly gitCommit: string;
  readonly capabilitySnapshot: VerificationCapabilitySnapshot;
  readonly deploymentResult?: DeploymentVerificationResult;
  readonly browserResult?: BrowserVerificationResult;
  readonly screenshots: readonly string[];
  readonly consoleLogs: readonly any[];
  readonly networkLogs: readonly any[];
  readonly domSnapshot?: string;
  readonly finalStatus: 'PASS' | 'FAIL' | 'BLOCKED';
  readonly completionGatePassed: boolean;
}
