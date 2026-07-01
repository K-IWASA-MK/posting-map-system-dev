/**
 * AuditGateDecision — 進化操作の通過/遮断/差戻/エスカレーション判定
 *
 * ⚠️ Phase132 の AuditResult（横断監査報告）とは異なる。
 * Phase132 = 「この状態は正しいか？」を評価する横断監査エンジン
 * Phase142.5 = 「この変更を通してよいか？」を進化操作の直前に判定するゲート
 */
export enum AuditGateDecision {
  ALLOW = "ALLOW",
  BLOCK = "BLOCK",
  MODIFY_REQUEST = "MODIFY_REQUEST",
  ESCALATE = "ESCALATE",
  SIMULATE_ONLY = "SIMULATE_ONLY"
}

/**
 * AuditLevel — 監査ゲートの深度レベル
 */
export enum AuditLevel {
  L0_STRUCTURAL_SAFETY = "L0_STRUCTURAL_SAFETY",
  L1_EXECUTION_SAFETY = "L1_EXECUTION_SAFETY",
  L2_CROSS_LAYER_CONSISTENCY = "L2_CROSS_LAYER_CONSISTENCY",
  L3_GOVERNANCE_ALIGNMENT = "L3_GOVERNANCE_ALIGNMENT",
  L4_SYSTEM_WIDE_IMPACT = "L4_SYSTEM_WIDE_IMPACT"
}

/**
 * AuditSignal — 進化操作の変更要求シグナル
 *
 * 進化レイヤー（Optimization / Adaptation / Rewriting）から
 * Audit Gate に送信される変更要求の構造体。
 */
export interface AuditSignal {
  id: string;
  sourceLayer: string;
  targetLayer: string;
  changeType: string;
  impactScore: number;
  riskScore: number;
  dependencyScope: string[];
}
