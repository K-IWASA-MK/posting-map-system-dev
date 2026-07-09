import { ExecutionRecord, ExecutionState } from './ExecutionLedgerRegistry';
import { CapabilityRegistry } from './CapabilityRegistry';
import { SkillPipelineRegistry } from './SkillPipelineRegistry';
import { SkillRegistry } from './SkillRegistry';

/**
 * ExecutionLedgerValidator.ts
 * 
 * ExecutionRecord の整合性、日付順序、および状態遷移を検証するバリデータ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export class ExecutionLedgerValidator {
  private static readonly iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

  /**
   * ExecutionRecord 自体の妥当性を検証する
   */
  static validate(record: ExecutionRecord): void {
    if (!record) {
      throw new Error('[ExecutionLedgerValidator] Record is required');
    }

    // IDの単調増加形式の検証
    if (!record.executionId || !/^ledger-\d+$/.test(record.executionId)) {
      throw new Error(`[ExecutionLedgerValidator] Invalid executionId format: ${record.executionId}`);
    }

    if (typeof record.description !== 'string') {
      throw new Error('[ExecutionLedgerValidator] Description must be a string');
    }

    // State検証
    if (!record.executionState || !Object.values(ExecutionState).includes(record.executionState)) {
      throw new Error(`[ExecutionLedgerValidator] Invalid executionState: ${record.executionState}`);
    }

    // Version検証 (semver x.y.z)
    const semverRegex = /^\d+\.\d+\.\d+$/;
    if (!record.version || !semverRegex.test(record.version)) {
      throw new Error(`[ExecutionLedgerValidator] Invalid version: ${record.version}`);
    }
    if (!record.ledgerVersion || !semverRegex.test(record.ledgerVersion)) {
      throw new Error(`[ExecutionLedgerValidator] Invalid ledgerVersion: ${record.ledgerVersion}`);
    }

    // ISO8601形式の検証
    if (!record.timestamp || !this.iso8601Regex.test(record.timestamp)) {
      throw new Error(`[ExecutionLedgerValidator] Invalid timestamp format: ${record.timestamp}`);
    }
    if (!record.createdAt || !this.iso8601Regex.test(record.createdAt)) {
      throw new Error(`[ExecutionLedgerValidator] Invalid createdAt format: ${record.createdAt}`);
    }
    if (!record.updatedAt || !this.iso8601Regex.test(record.updatedAt)) {
      throw new Error(`[ExecutionLedgerValidator] Invalid updatedAt format: ${record.updatedAt}`);
    }

    // 日付の順序整合性（createdAt <= updatedAt）
    const createdTime = new Date(record.createdAt).getTime();
    const updatedTime = new Date(record.updatedAt).getTime();
    if (createdTime > updatedTime) {
      throw new Error(`[ExecutionLedgerValidator] Date sequence violation: createdAt (${record.createdAt}) is after updatedAt (${record.updatedAt})`);
    }

    // Capability 存在検証 (SSOT)
    if (!record.capabilityId) {
      throw new Error('[ExecutionLedgerValidator] capabilityId is required');
    }
    const cap = CapabilityRegistry.get(record.capabilityId) || CapabilityRegistry.getByName(record.capabilityId);
    if (!cap) {
      throw new Error(`[ExecutionLedgerValidator] Capability not registered: ${record.capabilityId}`);
    }

    // Pipeline 存在検証 (SSOT)
    if (!record.pipelineId) {
      throw new Error('[ExecutionLedgerValidator] pipelineId is required');
    }
    const pipeline = SkillPipelineRegistry.get(record.pipelineId) || SkillPipelineRegistry.getByName(record.pipelineId);
    if (!pipeline) {
      throw new Error(`[ExecutionLedgerValidator] Pipeline not registered: ${record.pipelineId}`);
    }

    // Skill 存在検証 (SSOT)
    if (!record.skillIds || !Array.isArray(record.skillIds)) {
      throw new Error('[ExecutionLedgerValidator] skillIds array is required');
    }
    for (const skillId of record.skillIds) {
      const skill = SkillRegistry.get(skillId) || SkillRegistry.getByName(skillId);
      if (!skill) {
        throw new Error(`[ExecutionLedgerValidator] Skill not registered: ${skillId}`);
      }
    }
  }

  /**
   * 状態遷移の妥当性を検証する (INVALID_EXECUTION_STATE_TRANSITION)
   */
  static validateTransition(oldState: ExecutionState, newState: ExecutionState): void {
    if (oldState === newState) {
      return; // 同一状態は許可
    }

    // 終端状態からの遷移は不可
    if (oldState === ExecutionState.COMPLETED || oldState === ExecutionState.FAILED || oldState === ExecutionState.CANCELLED) {
      throw new Error(`[ExecutionLedgerValidator] INVALID_EXECUTION_STATE_TRANSITION: Cannot transition from terminal state ${oldState} to ${newState}`);
    }

    // 遷移規則のチェック
    let allowed = false;
    switch (oldState) {
      case ExecutionState.PLANNED:
        allowed = newState === ExecutionState.READY || newState === ExecutionState.CANCELLED;
        break;
      case ExecutionState.READY:
        allowed = newState === ExecutionState.EXECUTING || newState === ExecutionState.CANCELLED;
        break;
      case ExecutionState.EXECUTING:
        allowed = newState === ExecutionState.COMPLETED || newState === ExecutionState.FAILED || newState === ExecutionState.CANCELLED;
        break;
    }

    if (!allowed) {
      throw new Error(`[ExecutionLedgerValidator] INVALID_EXECUTION_STATE_TRANSITION: Transition from ${oldState} to ${newState} is not allowed`);
    }
  }
}
