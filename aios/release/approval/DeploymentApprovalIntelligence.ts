/**
 * DeploymentApprovalIntelligence.ts
 * 
 * Deployment Target Verification Gate - Approval Intelligence Engine (Sprint DTVG-11)
 * リソースリクエスト、リスク予測、過去の障害ナレッジを総合評価し、
 * デプロイ判断 (ALLOW / DENY / REQUIRE_REVIEW)、根拠、エビデンスおよび Confidence を算出する。
 */

import { DeploymentGateRequest } from '../gates/types/DeploymentTargetGateTypes';
import { DeploymentRiskPredictor } from '../improvement/DeploymentRiskPredictor';
import { DeploymentKnowledgeRegistry } from '../feedback/DeploymentKnowledgeRegistry';
import { ExecutionLedgerRegistry } from '../../../sdk/ExecutionLedgerRegistry';
import {
  ApprovalDecision,
  ApprovalReason,
  DecisionReport,
  EvidenceReference
} from './DeploymentApprovalTypes';
import { DeploymentDecisionExplainer } from './DeploymentDecisionExplainer';

export class DeploymentApprovalIntelligence {
  private readonly riskPredictor: DeploymentRiskPredictor;

  constructor() {
    this.riskPredictor = new DeploymentRiskPredictor();
  }

  /**
   * DeploymentGateRequest を総合評価し、理由・エビデンス付きの DecisionReport を生成する
   */
  public evaluate(request: DeploymentGateRequest): DecisionReport {
    DeploymentKnowledgeRegistry.initializeDefaults();

    const riskPrediction = this.riskPredictor.predictRisk(request);
    const reasons: ApprovalReason[] = [];
    const evidences: EvidenceReference[] = [];

    let decision: ApprovalDecision = 'ALLOW';
    let confidence = 96;

    // リスクレベルに応じた一次判定
    if (riskPrediction.riskLevel === 'CRITICAL' || riskPrediction.score >= 70) {
      decision = 'DENY';
      confidence = 95;
    } else if (riskPrediction.riskLevel === 'HIGH' || riskPrediction.score >= 35) {
      decision = 'REQUIRE_REVIEW';
      confidence = 92;
    } else if (riskPrediction.riskLevel === 'MEDIUM') {
      decision = 'REQUIRE_REVIEW';
      confidence = 88;
    } else {
      decision = 'ALLOW';
      confidence = 96;
    }

    // 予測障害と過去ナレッジの照合 & 理由構築
    for (const predictedFail of riskPrediction.predictedFailures) {
      if (predictedFail.includes('Gate-004')) {
        reasons.push({
          reasonId: `REAS-CFG-${Date.now()}`,
          category: 'RUNTIME_CONFIG',
          statement: 'Endpoint in config.js specifies outdated GAS Deployment ID.',
          weight: 40
        });
        evidences.push({
          evidenceId: `EVI-CFG-${Date.now()}`,
          source: 'DeploymentKnowledgeRegistry',
          gateOrPatternId: 'PAT-CONFIG-004',
          detail: 'Matches pattern: Stale Runtime Endpoint Configuration'
        });
      }

      if (predictedFail.includes('Gate-003')) {
        reasons.push({
          reasonId: `REAS-ROOT-${Date.now()}`,
          category: 'PUBLISH_ROOT',
          statement: 'Edited asset path lies outside designated publish root boundary.',
          weight: 35
        });
        evidences.push({
          evidenceId: `EVI-ROOT-${Date.now()}`,
          source: 'DeploymentKnowledgeRegistry',
          gateOrPatternId: 'PAT-ROOT-003',
          detail: 'Matches pattern: Publish Root Boundary Violation'
        });
      }

      if (predictedFail.includes('Gate-001')) {
        reasons.push({
          reasonId: `REAS-REPO-${Date.now()}`,
          category: 'REPOSITORY_MATCH',
          statement: 'Target repository identity mismatch detected.',
          weight: 35
        });
        evidences.push({
          evidenceId: `EVI-REPO-${Date.now()}`,
          source: 'DeploymentKnowledgeRegistry',
          gateOrPatternId: 'PAT-REPO-001',
          detail: 'Matches pattern: Repository Match Violation'
        });
      }
    }

    // 過去 ExecutionLedger 履歴の確認
    try {
      const ledgers = ExecutionLedgerRegistry.getAll();
      if (ledgers.length > 0) {
        evidences.push({
          evidenceId: `EVI-LEDGER-${Date.now()}`,
          source: 'ExecutionLedger',
          gateOrPatternId: 'ExecutionLedgerRegistry',
          detail: `Audited against ${ledgers.length} historical execution ledger records.`
        });
      }
    } catch (e) {}

    // クリーン判定時の理由
    if (reasons.length === 0) {
      reasons.push({
        reasonId: `REAS-OK-${Date.now()}`,
        category: 'GOVERNANCE_PASS',
        statement: 'Verified repository, branch, publish root, and runtime endpoint integrity.',
        weight: 100
      });
    }

    const explanationMarkdown = DeploymentDecisionExplainer.generateExplanation(
      request.releaseId,
      decision,
      confidence,
      reasons,
      evidences
    );

    return {
      reportId: `RPT-${request.releaseId}-${Date.now()}`,
      releaseId: request.releaseId,
      employeeId: request.employeeId,
      decision,
      confidence,
      reasons,
      evidences,
      explanationMarkdown,
      evaluatedAt: new Date().toISOString()
    };
  }
}
