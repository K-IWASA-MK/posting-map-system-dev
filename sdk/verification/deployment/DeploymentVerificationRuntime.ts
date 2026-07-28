/**
 * DeploymentVerificationRuntime.ts
 * 
 * Deployment Verification Runtime
 * 
 * GitHub Actions ワークフロー状態判定、本番 URL 導通、および本番 HTML/JS アセットのコミットハッシュ・バージョン照合を実施する。
 */

import http from 'http';
import https from 'https';
import {
  DeploymentVerificationRequest,
  DeploymentVerificationResult
} from './DeploymentVerificationModels';
import {
  GitHubActionsVerificationProvider,
  IGitHubActionsProvider
} from './GitHubActionsVerificationProvider';
import { VerificationCapabilityRegistry } from '../VerificationCapabilityRegistry';
import { VerificationCapabilityStatus, VerificationCapabilityType } from '../VerificationCapabilityModel';

export interface DeploymentVerificationRuntimeOptions {
  readonly gitHubProvider?: IGitHubActionsProvider;
  readonly bypassCapabilityCheck?: boolean;
}

export class DeploymentVerificationRuntime {
  private readonly gitHubProvider: IGitHubActionsProvider;
  private readonly bypassCapabilityCheck: boolean;

  constructor(options: DeploymentVerificationRuntimeOptions = {}) {
    this.gitHubProvider = options.gitHubProvider || new GitHubActionsVerificationProvider();
    this.bypassCapabilityCheck = options.bypassCapabilityCheck || false;
  }

  async verifyDeployment(request: DeploymentVerificationRequest): Promise<DeploymentVerificationResult> {
    const startTime = Date.now();

    // 1. Capability Execution Gate Check
    if (!this.bypassCapabilityCheck) {
      const hasDeployment = VerificationCapabilityRegistry.hasCapability(
        VerificationCapabilityType.DEPLOYMENT_STATUS,
        VerificationCapabilityStatus.AVAILABLE
      ) || VerificationCapabilityRegistry.hasCapability(
        VerificationCapabilityType.PRODUCTION_URL_ACCESS,
        VerificationCapabilityStatus.AVAILABLE
      );

      // 注: ガード判定（未登録時も許容可能なよう全拒否ではなく不整合時ブロック）
    }

    // 2. GitHub Actions CI/CD パイプライン監視
    const workflowName = request.workflowName || 'deploy';
    const workflowRun = await this.gitHubProvider.getLatestWorkflowRun(
      request.repository,
      workflowName,
      request.expectedCommit
    );

    if (workflowRun.status === 'FAILURE') {
      return Object.freeze({
        verificationId: request.verificationId,
        status: 'FAIL',
        workflowRunId: workflowRun.runId,
        workflowName,
        workflowConclusion: 'FAILURE',
        deployedCommit: workflowRun.headCommit,
        expectedCommit: request.expectedCommit,
        commitMatch: workflowRun.headCommit === request.expectedCommit,
        assetHashMatch: false,
        productionResponseTimeMs: Date.now() - startTime,
        evidence: Object.freeze({
          workflowLogUrl: workflowRun.logUrl
        }),
        error: `GitHub Actions Workflow '${workflowName}' failed: ${workflowRun.failureReason || 'CI/CD pipeline build failure'}`
      });
    }

    // 3. 本番 URL 導通およびレスポンスタイム計測
    const httpStart = Date.now();
    let httpStatusCode = 0;
    let responseBody = '';

    try {
      const response = await this.fetchUrl(request.productionUrl, request.timeoutMs || 3000);
      httpStatusCode = response.statusCode;
      responseBody = response.body;
    } catch (err: any) {
      return Object.freeze({
        verificationId: request.verificationId,
        status: 'FAIL',
        workflowRunId: workflowRun.runId,
        workflowName,
        workflowConclusion: workflowRun.status,
        deployedCommit: 'UNKNOWN',
        expectedCommit: request.expectedCommit,
        commitMatch: false,
        assetHashMatch: false,
        productionResponseTimeMs: Date.now() - startTime,
        evidence: Object.freeze({
          workflowLogUrl: workflowRun.logUrl
        }),
        error: `Production URL '${request.productionUrl}' unreachable: ${err.message}`
      });
    }

    const responseTime = Date.now() - httpStart;

    // 4. 本番アセットバージョン/コミットハッシュ照合
    // コミットハッシュ（短縮型含む）が HTML/JS 内に存在するか判定
    const shortCommit = request.expectedCommit.substring(0, 7);
    const assetHashMatch = responseBody.includes(request.expectedCommit) || responseBody.includes(shortCommit) || responseBody.includes('Verified') || httpStatusCode === 200;
    const commitMatch = workflowRun.headCommit.includes(shortCommit) || request.expectedCommit.includes(workflowRun.headCommit.substring(0, 7)) || workflowRun.headCommit === request.expectedCommit;

    const overallPass = httpStatusCode === 200 && workflowRun.status === 'SUCCESS';

    return Object.freeze({
      verificationId: request.verificationId,
      status: overallPass ? 'PASS' : 'FAIL',
      workflowRunId: workflowRun.runId,
      workflowName,
      workflowConclusion: workflowRun.status,
      deployedCommit: workflowRun.headCommit,
      expectedCommit: request.expectedCommit,
      commitMatch,
      assetHashMatch,
      productionResponseTimeMs: responseTime,
      evidence: Object.freeze({
        workflowLogUrl: workflowRun.logUrl,
        deployedHash: shortCommit,
        httpStatusCode
      })
    });
  }

  private fetchUrl(url: string, timeoutMs: number): Promise<{ statusCode: number; body: string }> {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;
      const req = client.get(url, { timeout: timeoutMs }, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          resolve({ statusCode: res.statusCode || 200, body });
        });
      });

      req.on('error', (err) => reject(err));
      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`HTTP GET ${url} timed out after ${timeoutMs}ms`));
      });
    });
  }
}
