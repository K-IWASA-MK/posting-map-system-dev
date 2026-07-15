import { QualityGateRecord, QualityGateState } from './QualityGateRegistry';

/**
 * QualityGateAdapter.ts
 * 
 * QualityGateRecord オブジェクトからダッシュボード UI 表示用等の ViewModel への変換を担当するアダプター。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export interface QualityGateViewModel {
  readonly id: string;
  readonly description: string;
  readonly ledgerId: string;
  readonly evaluationState: string;
  readonly passed: boolean;
  readonly summary: string;
  readonly ruleVersionTag: string;
  readonly auditSource: string;
  readonly elapsedLabel: string;
  readonly versionTag: string;
}

export class QualityGateAdapter {
  /**
   * QualityGateRecord から不変な UI 表示用 ViewModel を生成する
   */
  static toViewModel(record: QualityGateRecord): QualityGateViewModel {
    if (!record) {
      throw new Error('[QualityGateAdapter] record is required');
    }

    const start = new Date(record.createdAt).getTime();
    const end = new Date(record.updatedAt).getTime();
    const elapsedMs = Math.max(0, end - start);
    const elapsedLabel = `${(elapsedMs / 1000).toFixed(2)}s`;

    const viewModel: QualityGateViewModel = {
      id: record.gateId,
      description: record.description,
      ledgerId: record.ledgerId,
      evaluationState: record.evaluationState.toUpperCase(),
      passed: record.passed,
      summary: record.evaluationSummary,
      ruleVersionTag: `rule-v${record.ruleVersion}`,
      auditSource: record.auditSource,
      elapsedLabel: elapsedLabel,
      versionTag: `v${record.version}`
    };

    return Object.freeze(viewModel);
  }
}
