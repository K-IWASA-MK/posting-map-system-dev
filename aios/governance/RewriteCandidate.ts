/**
 * SafetyDecision — 書き換え許可/拒否の構造ルール定義
 *
 * ⚠️ これは"制御ロジック"ではなく
 * 「書き換えを許可するための構造ルール」の定義である。
 * 実行しない。判断しない（アルゴリズム）。定義だけする。
 */
export enum SafetyDecision {
  ALLOW_REWRITE = "ALLOW_REWRITE",
  DENY_REWRITE = "DENY_REWRITE",
  PARTIAL_REWRITE = "PARTIAL_REWRITE",
  SIMULATION_ONLY = "SIMULATION_ONLY",
  ESCALATE_TO_META_GOVERNANCE = "ESCALATE_TO_META_GOVERNANCE"
}

/**
 * SafetyRiskLevel — 書き換えリスクの5段階定義
 */
export enum SafetyRiskLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
  SYSTEM_BREAKING = "SYSTEM_BREAKING"
}

/**
 * RewriteCandidate — 書き換え候補の構造定義
 *
 * Phase142.6（Safety Model）= 安全判断レイヤー（構造ルール定義）
 * Phase143（Self-Rewriting）= 構造変更レイヤー（書き換え構造定義）
 * この境界は絶対不可侵。
 */
export interface RewriteCandidate {
  id: string;
  targetLayer: string;
  changeType: string;
  impactScope: string[];
  dependencyGraphRef: string;
  riskScore: number;
  simulationResult?: any;
}
