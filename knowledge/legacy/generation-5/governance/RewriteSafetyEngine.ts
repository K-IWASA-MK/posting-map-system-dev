import { RewriteCandidate, SafetyDecision } from "./RewriteCandidate";

/**
 * IRewriteSafetyEngine — 書き換え安全性ルール定義エンジンインターフェース
 *
 * ⚠️ 本インターフェースは"制御ロジック"を定義するものではない。
 * 「書き換えを許可するための構造ルール」の型契約のみを提供する。
 *
 * Phase142.6 = 安全判断レイヤー（構造ルール定義）
 * Phase143  = 構造変更レイヤー（書き換え構造定義）
 */
export interface IRewriteSafetyEngine {
  analyze(candidate: RewriteCandidate): Promise<number>;
  simulate(candidate: RewriteCandidate): Promise<Record<string, any>>;
  validate(candidate: RewriteCandidate): Promise<boolean>;
  decide(candidate: RewriteCandidate): Promise<SafetyDecision>;
  escalate(candidate: RewriteCandidate): Promise<boolean>;
}

export abstract class BaseRewriteSafetyEngine implements IRewriteSafetyEngine {
  abstract analyze(candidate: RewriteCandidate): Promise<number>;
  abstract simulate(candidate: RewriteCandidate): Promise<Record<string, any>>;
  abstract validate(candidate: RewriteCandidate): Promise<boolean>;
  abstract decide(candidate: RewriteCandidate): Promise<SafetyDecision>;
  abstract escalate(candidate: RewriteCandidate): Promise<boolean>;
}
