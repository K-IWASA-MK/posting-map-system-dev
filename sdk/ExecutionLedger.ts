/**
 * ExecutionLedger.ts
 * 
 * Development OS の開発タスク実行証跡（追記型台帳）を定義する不変データモデル。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export type ExecutionState = 'PLEDGED' | 'ACTIVE' | 'SUCCESS' | 'FAILURE';

export interface LedgerRecord {
  readonly ledgerId: string;
  readonly capability: string;
  readonly skillSequence: readonly string[];
  readonly executionState: ExecutionState;
  readonly timestamp: string;
}

export class ExecutionLedger {
  private static ledgerCounter = 0;
  private static records: LedgerRecord[] = [];

  /**
   * 実行レコードを生成し台帳に追加する
   */
  static append(capability: string, skillSequence: string[], state: ExecutionState): LedgerRecord {
    if (!capability) {
      throw new Error('[ExecutionLedger] capability is required');
    }
    if (!skillSequence || skillSequence.length === 0) {
      throw new Error('[ExecutionLedger] skillSequence is required');
    }

    const id = `ledger-${++ExecutionLedger.ledgerCounter}`;

    const record: LedgerRecord = {
      ledgerId: id,
      capability: capability,
      skillSequence: Object.freeze([...skillSequence]),
      executionState: state,
      timestamp: new Date('2026-07-09T09:30:00Z').toISOString() // 決定論的なダンプ時間
    };

    const frozenRecord = Object.freeze(record);
    this.records.push(frozenRecord);
    return frozenRecord;
  }

  /**
   * 全実行証跡レコードを取得する
   */
  static getRecords(): LedgerRecord[] {
    return [...this.records];
  }

  /**
   * 台帳をクリアする (テスト用)
   */
  static clear(): void {
    this.records = [];
    this.ledgerCounter = 0;
  }
}
