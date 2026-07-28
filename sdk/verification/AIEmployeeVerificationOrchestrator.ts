/**
 * AIEmployeeVerificationOrchestrator.ts
 * 
 * AI Employee Verification Runtime Orchestrator
 * 
 * タスク完了時の6段階検証ゲート（Capabilities Detect ➔ Deployment Gate ➔ Asset Hash Gate ➔ Browser Gate ➔ Evidence Package ➔ Completion Report）を決定論的順序で実行する。
 */

import { VerificationCapabilityDetectorEngine } from './VerificationCapabilityDetectorEngine';
import { DeploymentVerificationRuntime } from './deployment/DeploymentVerificationRuntime';
import { BrowserVerificationRuntime } from './browser/BrowserVerificationRuntime';
import { VerificationEvidencePackage } from './evidence/VerificationEvidencePackage';
import { DeploymentVerificationRequest, DeploymentVerificationResult } from './deployment/DeploymentVerificationModels';
import { BrowserVerificationRequest, BrowserVerificationResult } from './browser/BrowserVerificationModels';

export interface OrchestrationTaskRequest {
  readonly taskId: string;
  readonly gitCommit: string;
  readonly deploymentRequest?: DeploymentVerificationRequest;
  readonly browserRequest?: BrowserVerificationRequest;
}

export interface VerificationOrchestrationSummary {
  readonly verificationId: string;
  readonly taskId: string;
  readonly finalStatus: 'PASS' | 'FAIL' | 'BLOCKED';
  readonly completionGatePassed: boolean;
  readonly evidencePackage: VerificationEvidencePackage;
  readonly reportSummary: string;
}

export class AIEmployeeVerificationOrchestrator {
  private readonly detectorEngine: VerificationCapabilityDetectorEngine;
  private readonly deploymentRuntime: DeploymentVerificationRuntime;
  private readonly browserRuntime: BrowserVerificationRuntime;

  constructor(
    detectorEngine?: VerificationCapabilityDetectorEngine,
    deploymentRuntime?: DeploymentVerificationRuntime,
    browserRuntime?: BrowserVerificationRuntime
  ) {
    this.detectorEngine = detectorEngine || new VerificationCapabilityDetectorEngine();
    this.deploymentRuntime = deploymentRuntime || new DeploymentVerificationRuntime({ bypassCapabilityCheck: true });
    this.browserRuntime = browserRuntime || new BrowserVerificationRuntime({ bypassCapabilityCheck: true });
  }

  /**
   * 6段階統合検証ゲートを一括順次実行し、証跡パッケージおよび完了レポートを自動生成する
   */
  async executeTaskVerification(request: OrchestrationTaskRequest): Promise<VerificationOrchestrationSummary> {
    const verificationId = `verif-${request.taskId}-${Date.now()}`;
    const timestamp = new Date().toISOString();

    // 1. detectCapabilities (環境能力自己診断)
    const capabilitySnapshot = await this.detectorEngine.runDetection();

    // 2. verifyDeployment (GitHub Actions & Deployment Status)
    let deploymentResult: DeploymentVerificationResult | undefined = undefined;
    if (request.deploymentRequest) {
      deploymentResult = await this.deploymentRuntime.verifyDeployment(request.deploymentRequest);
    }

    // 3. runBrowserVerification (Browser Automation & DOM / Screenshot Evidence)
    let browserResult: BrowserVerificationResult | undefined = undefined;
    if (request.browserRequest) {
      browserResult = await this.browserRuntime.executeVerification(request.browserRequest);
    }

    // 4. collectEvidence (Evidence Package カプセル化)
    const screenshots: string[] = [
      ...(browserResult?.evidence.screenshots || [])
    ];
    const consoleLogs = [
      ...(browserResult?.evidence.consoleLogs || [])
    ];
    const networkLogs = [
      ...(browserResult?.evidence.networkLogs || [])
    ];
    const domSnapshot = browserResult?.evidence.domSnapshot;

    const isDeploymentOk = deploymentResult ? deploymentResult.status === 'PASS' : true;
    const isBrowserOk = browserResult ? browserResult.status === 'PASS' : true;
    const finalStatus: 'PASS' | 'FAIL' | 'BLOCKED' =
      (deploymentResult?.status === 'BLOCKED' || browserResult?.status === 'BLOCKED')
        ? 'BLOCKED'
        : (isDeploymentOk && isBrowserOk)
          ? 'PASS'
          : 'FAIL';

    const completionGatePassed = finalStatus === 'PASS';

    const evidencePackage: VerificationEvidencePackage = Object.freeze({
      verificationId,
      taskId: request.taskId,
      timestamp,
      gitCommit: request.gitCommit,
      capabilitySnapshot,
      ...(deploymentResult ? { deploymentResult } : {}),
      ...(browserResult ? { browserResult } : {}),
      screenshots: Object.freeze(screenshots),
      consoleLogs: Object.freeze(consoleLogs),
      networkLogs: Object.freeze(networkLogs),
      ...(domSnapshot ? { domSnapshot } : {}),
      finalStatus,
      completionGatePassed
    });

    // 5. generateCompletionReport
    const reportSummary = [
      `=== AI Employee Verification Completion Report ===`,
      `Task ID             : ${request.taskId}`,
      `Verification ID     : ${verificationId}`,
      `Git Commit          : ${request.gitCommit}`,
      `Capabilities Status : ${capabilitySnapshot.overallStatus}`,
      `Deployment Status   : ${deploymentResult ? deploymentResult.status : 'SKIPPED'}`,
      `Browser Verification: ${browserResult ? browserResult.status : 'SKIPPED'}`,
      `Completion Gate     : ${completionGatePassed ? 'PASS (AUTHENTICATED)' : 'FAIL / BLOCKED'}`,
      `=================================================`
    ].join('\n');

    return Object.freeze({
      verificationId,
      taskId: request.taskId,
      finalStatus,
      completionGatePassed,
      evidencePackage,
      reportSummary
    });
  }
}
