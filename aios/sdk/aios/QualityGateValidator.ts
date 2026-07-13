import { QualityGateRecord, QualityGateState } from './QualityGateRegistry';
import { ExecutionLedgerRegistry } from './ExecutionLedgerRegistry';

/**
 * QualityGateValidator.ts
 * 
 * QualityGateRecord の整合性、日付順序、および合否条件・状態遷移を検証するバリデータ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export class QualityGateValidator {
  private static readonly iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

  /**
   * QualityGateRecord 自体の妥当性を検証する
   */
  static validate(record: QualityGateRecord): void {
    if (!record) {
      throw new Error('[QualityGateValidator] Record is required');
    }

    // IDの単調増加形式の検証
    if (!record.gateId || !/^gate-\d+$/.test(record.gateId)) {
      throw new Error(`[QualityGateValidator] Invalid gateId format: ${record.gateId}`);
    }

    if (typeof record.description !== 'string') {
      throw new Error('[QualityGateValidator] Description must be a string');
    }

    // State検証
    if (!record.evaluationState || !Object.values(QualityGateState).includes(record.evaluationState)) {
      throw new Error(`[QualityGateValidator] Invalid evaluationState: ${record.evaluationState}`);
    }

    // Version検証 (semver x.y.z)
    const semverRegex = /^\d+\.\d+\.\d+$/;
    if (!record.version || !semverRegex.test(record.version)) {
      throw new Error(`[QualityGateValidator] Invalid version: ${record.version}`);
    }
    if (!record.gateVersion || !semverRegex.test(record.gateVersion)) {
      throw new Error(`[QualityGateValidator] Invalid gateVersion: ${record.gateVersion}`);
    }
    if (!record.ruleVersion || !semverRegex.test(record.ruleVersion)) {
      throw new Error(`[QualityGateValidator] Invalid ruleVersion: ${record.ruleVersion}`);
    }

    // AuditSource検証
    if (!record.auditSource || typeof record.auditSource !== 'string') {
      throw new Error('[QualityGateValidator] Invalid auditSource');
    }

    // ISO8601形式の検証
    if (!record.createdAt || !this.iso8601Regex.test(record.createdAt)) {
      throw new Error(`[QualityGateValidator] Invalid createdAt format: ${record.createdAt}`);
    }
    if (!record.updatedAt || !this.iso8601Regex.test(record.updatedAt)) {
      throw new Error(`[QualityGateValidator] Invalid updatedAt format: ${record.updatedAt}`);
    }

    // 日付の順序整合性（createdAt <= updatedAt）
    const createdTime = new Date(record.createdAt).getTime();
    const updatedTime = new Date(record.updatedAt).getTime();
    if (createdTime > updatedTime) {
      throw new Error(`[QualityGateValidator] Date sequence violation: createdAt (${record.createdAt}) is after updatedAt (${record.updatedAt})`);
    }

    // Ledger 存在検証 (SSOT)
    if (!record.ledgerId) {
      throw new Error('[QualityGateValidator] ledgerId is required');
    }
    const ledger = ExecutionLedgerRegistry.get(record.ledgerId);
    if (!ledger) {
      throw new Error(`[QualityGateValidator] Execution Ledger not registered: ${record.ledgerId}`);
    }

    // 違反件数の負値チェック
    if (record.criticalCount < 0 || record.majorCount < 0 || record.minorCount < 0) {
      throw new Error('[QualityGateValidator] Violation counts cannot be negative');
    }

    // Passed 判定整合性検証 (Critical > 0 もしくは Major > 0 なら passed = false であること)
    if (record.passed && (record.criticalCount > 0 || record.majorCount > 0)) {
      throw new Error('[QualityGateValidator] INVALID_GATE_PASS_CONSISTENCY: passed cannot be true when critical or major violations exist');
    }

    // Passed 判定と State の整合性チェック (FAILED 状態なら passed は必ず false)
    if (record.evaluationState === QualityGateState.FAILED && record.passed) {
      throw new Error('[QualityGateValidator] passed cannot be true when state is FAILED');
    }
    if (record.evaluationState === QualityGateState.PASSED && !record.passed) {
      throw new Error('[QualityGateValidator] passed cannot be false when state is PASSED');
    }
  }

  /**
   * 状態遷移の妥当性を検証する (INVALID_GATE_STATE_TRANSITION)
   */
  static validateTransition(oldState: QualityGateState, newState: QualityGateState): void {
    if (oldState === newState) {
      return; // 同一状態は許可
    }

    // 終端状態からの遷移は不可
    if (oldState === QualityGateState.PASSED || oldState === QualityGateState.FAILED) {
      throw new Error(`[QualityGateValidator] INVALID_GATE_STATE_TRANSITION: Cannot transition from terminal state ${oldState} to ${newState}`);
    }

    // 遷移規則のチェック
    let allowed = false;
    switch (oldState) {
      case QualityGateState.CREATED:
        allowed = newState === QualityGateState.EVALUATED;
        break;
      case QualityGateState.EVALUATED:
        allowed = newState === QualityGateState.PASSED || newState === QualityGateState.FAILED;
        break;
    }

    if (!allowed) {
      throw new Error(`[QualityGateValidator] INVALID_GATE_STATE_TRANSITION: Transition from ${oldState} to ${newState} is not allowed`);
    }
  }
}
