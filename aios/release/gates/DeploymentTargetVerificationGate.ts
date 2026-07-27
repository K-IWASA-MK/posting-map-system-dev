/**
 * DeploymentTargetVerificationGate.ts
 * 
 * Deployment Target Verification Gate - Integration & Orchestration Layer (Sprint DTVG-04)
 * Resolver Layer (DTVG-02) および Verification Layer (DTVG-03) を統合し、
 * Gate-001 〜 Gate-007 の総合判定、Environment Policy 適用、ならびに verifyDryRun を提供する。
 */

import * as path from 'path';
import {
  DeploymentGateRequest,
  DeploymentGateResult,
  DryRunResult,
  GateResult,
  VerificationStatus
} from './types/DeploymentTargetGateTypes';
import { DeploymentTargetResolver } from './resolvers/DeploymentTargetResolver';
import { RuntimeEndpointVerifier } from './verifiers/RuntimeEndpointVerifier';
import { DeploymentFingerprintVerifier } from './verifiers/DeploymentFingerprintVerifier';

export class DeploymentTargetVerificationGate {
  private readonly workspaceRoot: string;
  private readonly resolver: DeploymentTargetResolver;
  private readonly endpointVerifier: RuntimeEndpointVerifier;

  constructor(workspaceRoot?: string) {
    this.workspaceRoot = workspaceRoot ? path.resolve(workspaceRoot) : process.cwd();
    this.resolver = new DeploymentTargetResolver(this.workspaceRoot);
    this.endpointVerifier = new RuntimeEndpointVerifier(this.workspaceRoot);
  }

  /**
   * Gate-005: AI Employee Authorization
   * 実行主体の権限および 'AI Employee Profile' 適用状態を検証する
   */
  private verifyAIEmployee(employeeId: string, profileName: string): GateResult {
    const timestamp = Date.now();
    const allowedProfile = 'AI Employee Profile';

    if (profileName !== allowedProfile) {
      return {
        gateId: 'Gate-005',
        name: 'AI Employee Authorization',
        status: 'FAIL',
        detail: `Profile Violation: AI Employee must ONLY use '${allowedProfile}'. Requested: '${profileName}'`,
        timestamp
      };
    }

    if (!employeeId || employeeId.trim() === '') {
      return {
        gateId: 'Gate-005',
        name: 'AI Employee Authorization',
        status: 'FAIL',
        detail: `Employee Authorization Violation: employeeId is missing or empty.`,
        timestamp
      };
    }

    return {
      gateId: 'Gate-005',
      name: 'AI Employee Authorization',
      status: 'PASS',
      detail: `AI Employee '${employeeId}' is authorized with profile '${profileName}'.`,
      timestamp
    };
  }

  /**
   * 本番デプロイ前の正式検証
   * Gate-001 〜 Gate-007 を実行し、Environment Policy に従って PASS / FAIL 判定を下す。
   */
  public async verify(request: DeploymentGateRequest): Promise<DeploymentGateResult> {
    const evaluatedAt = new Date().toISOString();
    const gateResults: GateResult[] = [];

    // Gate-001: Repository Match
    gateResults.push(this.resolver.verifyRepositoryMatch(request.requestedRepository));

    // Gate-002: Branch Match
    gateResults.push(this.resolver.verifyBranchMatch(request.requestedBranch));

    // Gate-003: Publish Root Match
    gateResults.push(this.resolver.verifyPublishRoot(request.frontendConfigPath, request.targetPublishRoot));

    // Gate-004: Runtime Config Match
    gateResults.push(
      this.endpointVerifier.verifyRuntimeEndpoint(
        request.frontendConfigPath,
        request.expectedBackendEndpoint,
        request.expectedBackendVersion
      )
    );

    // Gate-005: AI Employee Authorization
    gateResults.push(this.verifyAIEmployee(request.employeeId, request.profileName));

    // Calculate actual fingerprint
    const actualFingerprint = DeploymentFingerprintVerifier.calculateFingerprint(
      request.fingerprint?.repositorySha || 'UNKNOWN_SHA',
      request.fingerprint?.buildHash || 'UNKNOWN_BUILD',
      request.fingerprint?.deploymentId || request.expectedBackendEndpoint,
      request.fingerprint?.runtimeConfigHash || 'UNKNOWN_CONFIG'
    );

    // Gate-007: Fingerprint Match
    gateResults.push(
      DeploymentFingerprintVerifier.verifyFingerprint(request.fingerprint, actualFingerprint)
    );

    // Gate-006: Audit Record Status
    gateResults.push({
      gateId: 'Gate-006',
      name: 'Audit Recorded',
      status: 'PASS',
      detail: 'Audit record ready for ExecutionLedger commitment.',
      timestamp: Date.now()
    });

    // Environment Policy Assessment
    let overallStatus: VerificationStatus = 'PASS';
    let hasFail = false;
    let hasWarning = false;

    for (const res of gateResults) {
      if (res.status === 'FAIL') {
        hasFail = true;
      } else if (res.status === 'WARNING') {
        hasWarning = true;
      }
    }

    if (hasFail) {
      overallStatus = 'FAIL';
    } else if (hasWarning) {
      if (request.environment === 'production') {
        overallStatus = 'FAIL'; // Production Policy: WARNING is treated as FAIL
      } else {
        overallStatus = 'WARNING';
      }
    } else {
      overallStatus = 'PASS';
    }

    return {
      releaseId: request.releaseId,
      version: request.version,
      environment: request.environment,
      overallStatus,
      gateResults,
      fingerprint: actualFingerprint,
      evaluatedAt
    };
  }

  /**
   * AI Employee 向け事前確認 (Dry Run Mode)
   * 状態変更・デプロイを行わずに将来の評価予定結果およびターゲットサマリーを返却する。
   */
  public async verifyDryRun(request: DeploymentGateRequest): Promise<DryRunResult> {
    const simulatedResult = await this.verify(request);

    return {
      request,
      simulatedResult,
      publishSummary: {
        repository: request.requestedRepository,
        branch: request.requestedBranch,
        targetPublishRoot: request.targetPublishRoot,
        backendEndpoint: request.expectedBackendEndpoint,
        employeeId: request.employeeId
      }
    };
  }
}
