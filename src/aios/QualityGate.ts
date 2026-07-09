/**
 * QualityGate.ts
 * 
 * 開発作業完了時の品質ゲート評価結果（不変な品質評価メタデータ）を定義するモジュール。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export interface QualityStatus {
  readonly criticalViolations: number;
  readonly majorViolations: number;
  readonly minorViolations: number;
  readonly passed: boolean;
}

export class QualityGate {
  /**
   * 指標データから品質評価ステータスオブジェクトを作成する
   */
  static createStatus(critical: number, major: number, minor: number): QualityStatus {
    if (critical < 0 || major < 0 || minor < 0) {
      throw new Error('[QualityGate] Violations count cannot be negative');
    }

    // AIOS Architecture Charter に従い、Critical / Major が 0 の場合のみ合格 (passed: true) とする
    const isPassed = critical === 0 && major === 0;

    const status: QualityStatus = {
      criticalViolations: critical,
      majorViolations: major,
      minorViolations: minor,
      passed: isPassed
    };

    return Object.freeze(status);
  }
}
