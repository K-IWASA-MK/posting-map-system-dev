import { ExecutionRecord, ExecutionState } from './ExecutionLedgerRegistry';
import { ExecutionLedgerValidator } from './ExecutionLedgerValidator';

/**
 * ExecutionLedgerFactory.ts
 * 
 * 決定論的かつ不変な ExecutionRecord（監査証跡レコード）を生成するファクトリ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export class ExecutionLedgerFactory {
  private static instanceCounter = 0;

  /**
   * 不変な ExecutionRecord インスタンスを決定論的に生成する
   */
  static create(
    description: string,
    capabilityId: string,
    pipelineId: string,
    skillIds: string[],
    state: ExecutionState,
    version: string,
    ledgerVersion: string,
    createdAt: string = new Date().toISOString(),
    updatedAt: string = new Date().toISOString(),
    auditTrail: string[] = []
  ): ExecutionRecord {
    const id = `ledger-${++ExecutionLedgerFactory.instanceCounter}`;

    const record: ExecutionRecord = {
      executionId: id,
      ledgerVersion: ledgerVersion,
      description: description,
      capabilityId: capabilityId,
      pipelineId: pipelineId,
      skillIds: Object.freeze([...skillIds]),
      executionState: state,
      timestamp: createdAt,
      version: version,
      createdAt: createdAt,
      updatedAt: updatedAt,
      auditTrail: Object.freeze([...auditTrail, `Record Initialized as ${state} (${createdAt})`])
    };

    // 登録前の妥当性検証
    ExecutionLedgerValidator.validate(record);

    return Object.freeze(record);
  }

  /**
   * カウンタを取得する（検証用）
   */
  static getCounter(): number {
    return this.instanceCounter;
  }

  /**
   * カウンタのリセット（テスト用）
   */
  static resetCounter(): void {
    this.instanceCounter = 0;
  }
}
