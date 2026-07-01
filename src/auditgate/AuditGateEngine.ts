import { AuditSignal, AuditGateDecision } from "./AuditSignal";

/**
 * IAuditGateEngine — 進化前ゲート制御エンジンインターフェース
 *
 * ⚠️ Phase132 の IAutonomousAuditEngine（横断監査エンジン）とは責務が異なる。
 * Phase132 = 全レイヤーを横断して「正しいか」を評価
 * Phase142.5 = 進化操作の直前に「通してよいか」を判定
 */
export interface IAuditGateEngine {
  initialize(): Promise<boolean>;
  evaluate(signal: AuditSignal): Promise<number>;
  validate(signal: AuditSignal): Promise<boolean>;
  decide(signal: AuditSignal): Promise<AuditGateDecision>;
  escalate(signal: AuditSignal): Promise<boolean>;
  report(signal: AuditSignal): Promise<Record<string, any>>;
}

export abstract class BaseAuditGateEngine implements IAuditGateEngine {
  abstract initialize(): Promise<boolean>;
  abstract evaluate(signal: AuditSignal): Promise<number>;
  abstract validate(signal: AuditSignal): Promise<boolean>;
  abstract decide(signal: AuditSignal): Promise<AuditGateDecision>;
  abstract escalate(signal: AuditSignal): Promise<boolean>;
  abstract report(signal: AuditSignal): Promise<Record<string, any>>;
}
