import { QualityGateRecord, QualityGateState } from './QualityGateRegistry';
import { QualityGateValidator } from './QualityGateValidator';

/**
 * QualityGateFactory.ts
 * 
 * 決定論的かつ不変な QualityGateRecord を生成するファクトリ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export class QualityGateFactory {
  private static instanceCounter = 0;

  /**
   * 不変な QualityGateRecord インスタンスを決定論的に生成する
   */
  static create(
    description: string,
    ledgerId: string,
    criticalCount: number,
    majorCount: number,
    minorCount: number,
    state: QualityGateState,
    version: string,
    gateVersion: string,
    ruleVersion: string,
    auditSource: string = 'EXECUTION_LEDGER',
    createdAt: string = new Date().toISOString(),
    updatedAt: string = new Date().toISOString()
  ): QualityGateRecord {
    const id = `gate-${++QualityGateFactory.instanceCounter}`;
    const passed = (state === QualityGateState.PASSED) || (state !== QualityGateState.FAILED && criticalCount === 0 && majorCount === 0);
    const evaluationSummary = `${criticalCount} Critical / ${majorCount} Major / ${minorCount} Minor`;

    const record: QualityGateRecord = {
      gateId: id,
      gateVersion: gateVersion,
      description: description,
      ledgerId: ledgerId,
      criticalCount: criticalCount,
      majorCount: majorCount,
      minorCount: minorCount,
      passed: passed,
      evaluationState: state,
      evaluationSummary: evaluationSummary,
      ruleVersion: ruleVersion,
      auditSource: auditSource,
      createdAt: createdAt,
      updatedAt: updatedAt,
      version: version
    };

    // 登録前の妥当性検証
    QualityGateValidator.validate(record);

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
