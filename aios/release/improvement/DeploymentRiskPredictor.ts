/**
 * DeploymentRiskPredictor.ts
 * 
 * Deployment Target Verification Gate - Risk Predictor Layer (Sprint DTVG-10)
 * リリースリクエストの構成要素および過去の失敗ナレッジを照合し、
 * 事前リスクスコア（0〜100）および RiskLevel を自律推論する。
 */

import * as path from 'path';
import { DeploymentGateRequest } from '../gates/types/DeploymentTargetGateTypes';
import { DeploymentKnowledgeRegistry } from '../feedback/DeploymentKnowledgeRegistry';
import { RiskPrediction, RiskLevel } from './DeploymentImprovementTypes';

export class DeploymentRiskPredictor {
  /**
   * DeploymentGateRequest からリスクの度合いをスコア化および推論する
   */
  public predictRisk(request: DeploymentGateRequest): RiskPrediction {
    DeploymentKnowledgeRegistry.initializeDefaults();

    let score = 0;
    const predictedFailures: string[] = [];
    const reasons: string[] = [];

    // 1. Repository Match Risk Check
    if (!request.requestedRepository || request.requestedRepository.includes('wrong') || request.requestedRepository.includes('test-fail')) {
      score += 35;
      predictedFailures.push('Gate-001 (Repository Match)');
      reasons.push('Requested repository differs from verified origin remote.');
    }

    // 2. Publish Root Risk Check
    if (request.frontendConfigPath && request.targetPublishRoot) {
      const absConfig = path.resolve(request.frontendConfigPath);
      const absRoot = path.resolve(request.targetPublishRoot);
      if (!absConfig.startsWith(absRoot) && !absRoot.startsWith(absConfig)) {
        score += 30;
        predictedFailures.push('Gate-003 (Publish Root Match)');
        reasons.push('Source asset path lies outside the designated publish root.');
      }
    }

    // 3. Runtime Config Risk Check
    if (request.expectedBackendEndpoint.includes('OLD') || request.expectedBackendEndpoint.includes('STALE') || request.expectedBackendEndpoint.includes('OLD_DEPLOYMENT_ID')) {
      score += 40;
      predictedFailures.push('Gate-004 (Runtime Config Match)');
      reasons.push('Runtime config endpoint refers to an outdated GAS Deployment ID.');
    }

    // 4. Employee Authorization Risk Check
    if (request.profileName !== 'AI Employee Profile') {
      score += 25;
      predictedFailures.push('Gate-005 (AI Employee Authorization)');
      reasons.push('ProfileName is set to non-standard profile.');
    }

    // 5. Fingerprint Risk Check
    if (request.fingerprint && request.fingerprint.fingerprintHash?.includes('mismatched')) {
      score += 20;
      predictedFailures.push('Gate-007 (Deployment Fingerprint Match)');
      reasons.push('Fingerprint payload hash mismatch suspected.');
    }

    // Cap score at 100
    score = Math.min(100, score);

    let riskLevel: RiskLevel = 'LOW';
    if (score >= 70) {
      riskLevel = 'CRITICAL';
    } else if (score >= 40) {
      riskLevel = 'HIGH';
    } else if (score >= 20) {
      riskLevel = 'MEDIUM';
    }

    const reason = reasons.length > 0
      ? reasons.join(' ')
      : 'Deployment request satisfies baseline verification criteria with minimal risk.';

    return {
      riskId: `RISK-${request.releaseId}-${Date.now()}`,
      riskLevel,
      predictedFailures,
      score,
      reason
    };
  }
}
