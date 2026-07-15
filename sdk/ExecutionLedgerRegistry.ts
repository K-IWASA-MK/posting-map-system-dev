import { ExecutionLedgerValidator } from './ExecutionLedgerValidator';

/**
 * ExecutionLedgerRegistry.ts
 * 
 * Development OS 全体で使用する ExecutionLedger（実行監査台帳）の不変レジストリ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum ExecutionState {
  PLANNED = 'PLANNED',
  READY = 'READY',
  EXECUTING = 'EXECUTING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export interface ExecutionRecord {
  readonly executionId: string;
  readonly ledgerVersion: string;
  readonly description: string;
  readonly capabilityId: string;
  readonly pipelineId: string;
  readonly skillIds: readonly string[];
  readonly executionState: ExecutionState;
  readonly timestamp: string;
  readonly version: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly auditTrail: readonly string[];
}

export interface RegistryMetadata {
  readonly registryId: string;
  readonly registryVersion: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export class ExecutionLedgerRegistry {
  private static registry: Map<string, ExecutionRecord> = new Map();

  // レジストリメタデータの定義
  public static readonly metadata: RegistryMetadata = Object.freeze({
    registryId: 'reg-ledger-01',
    registryVersion: '1.0.0',
    createdAt: new Date('2026-07-09T09:30:00Z').toISOString(),
    updatedAt: new Date('2026-07-09T09:30:00Z').toISOString()
  });

  /**
   * ExecutionRecord を登録する
   */
  static register(record: ExecutionRecord): void {
    if (!record) {
      throw new Error('[ExecutionLedgerRegistry] Record cannot be empty');
    }
    if (!record.executionId) {
      throw new Error('[ExecutionLedgerRegistry] executionId is required');
    }

    if (this.registry.has(record.executionId)) {
      throw new Error(`[ExecutionLedgerRegistry] Record ID already registered: ${record.executionId}`);
    }

    // 検証
    ExecutionLedgerValidator.validate(record);

    this.registry.set(record.executionId, Object.freeze({
      ...record,
      skillIds: Object.freeze([...record.skillIds]),
      auditTrail: Object.freeze([...record.auditTrail])
    }));
  }

  /**
   * IDから Record を取得する
   */
  static get(executionId: string): ExecutionRecord | undefined {
    return this.registry.get(executionId);
  }

  /**
   * 親 Capability に属するすべての Record を取得する
   */
  static getByCapability(capabilityId: string): ExecutionRecord[] {
    const list: ExecutionRecord[] = [];
    for (const record of this.registry.values()) {
      if (record.capabilityId === capabilityId) {
        list.push(record);
      }
    }
    return list;
  }

  /**
   * 全 Record を取得する
   */
  static getAll(): ExecutionRecord[] {
    return Array.from(this.registry.values());
  }

  /**
   * 状態の完全置換アップデート（不変性の維持）
   */
  static updateState(executionId: string, newState: ExecutionState, auditMessage: string): void {
    const record = this.get(executionId);
    if (!record) {
      throw new Error(`[ExecutionLedgerRegistry] Record not found: ${executionId}`);
    }

    // 状態遷移検証
    ExecutionLedgerValidator.validateTransition(record.executionState, newState);

    const now = new Date().toISOString();
    const updatedRecord: ExecutionRecord = {
      ...record,
      executionState: newState,
      updatedAt: now,
      auditTrail: Object.freeze([...record.auditTrail, `${newState}: ${auditMessage} (${now})`])
    };

    // 再検証
    ExecutionLedgerValidator.validate(updatedRecord);

    this.registry.set(executionId, Object.freeze(updatedRecord));
  }

  /**
   * レジストリをクリアする（テスト用）
   */
  static clear(): void {
    this.registry.clear();
  }
}
