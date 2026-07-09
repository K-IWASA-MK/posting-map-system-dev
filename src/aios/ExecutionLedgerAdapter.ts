import { ExecutionRecord, ExecutionState } from './ExecutionLedgerRegistry';

/**
 * ExecutionLedgerAdapter.ts
 * 
 * ExecutionRecord オブジェクトからダッシュボード UI 表示用等の ViewModel への変換を担当するアダプター。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export interface LedgerViewModel {
  readonly id: string;
  readonly description: string;
  readonly capabilityId: string;
  readonly pipelineId: string;
  readonly skillCount: number;
  readonly stateLabel: string;
  readonly isTerminal: boolean;
  readonly durationLabel: string;
  readonly lastAuditMessage: string;
  readonly versionTag: string;
}

export class ExecutionLedgerAdapter {
  /**
   * ExecutionRecord から不変な UI 表示用 ViewModel を生成する
   */
  static toViewModel(record: ExecutionRecord): LedgerViewModel {
    if (!record) {
      throw new Error('[ExecutionLedgerAdapter] record is required');
    }

    const isTerminal = 
      record.executionState === ExecutionState.COMPLETED ||
      record.executionState === ExecutionState.FAILED ||
      record.executionState === ExecutionState.CANCELLED;

    const start = new Date(record.createdAt).getTime();
    const end = new Date(record.updatedAt).getTime();
    const durationMs = Math.max(0, end - start);
    const durationLabel = `${(durationMs / 1000).toFixed(2)}s`;

    const lastAuditMessage = record.auditTrail.length > 0 
      ? record.auditTrail[record.auditTrail.length - 1] 
      : 'No events logged';

    const viewModel: LedgerViewModel = {
      id: record.executionId,
      description: record.description,
      capabilityId: record.capabilityId,
      pipelineId: record.pipelineId,
      skillCount: record.skillIds.length,
      stateLabel: record.executionState.toUpperCase(),
      isTerminal: isTerminal,
      durationLabel: durationLabel,
      lastAuditMessage: lastAuditMessage,
      versionTag: `v${record.version}`
    };

    return Object.freeze(viewModel);
  }
}
