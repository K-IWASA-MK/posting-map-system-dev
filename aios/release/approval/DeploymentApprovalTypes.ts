/**
 * DeploymentApprovalTypes.ts
 * 
 * Deployment Target Verification Gate - Approval Intelligence Layer (Sprint DTVG-11)
 * AI Employee によるデプロイ可否判断（ALLOW / DENY / REQUIRE_REVIEW）、
 * 判断理由、エビデンス参照および信頼度を構造化する型定義。
 */

export type ApprovalDecision = 'ALLOW' | 'DENY' | 'REQUIRE_REVIEW';

export interface EvidenceReference {
  evidenceId: string;
  source: 'ExecutionLedger' | 'DeploymentKnowledgeRegistry' | 'RiskPredictor';
  gateOrPatternId: string;
  detail: string;
}

export interface ApprovalReason {
  reasonId: string;
  category: string;
  statement: string;
  weight: number; // 0 - 100
}

export interface DecisionReport {
  reportId: string;
  releaseId: string;
  employeeId: string;
  decision: ApprovalDecision;
  confidence: number; // 0 - 100
  reasons: ApprovalReason[];
  evidences: EvidenceReference[];
  explanationMarkdown: string;
  evaluatedAt: string;
}
