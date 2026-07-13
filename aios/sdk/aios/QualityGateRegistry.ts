import { QualityGateValidator } from './QualityGateValidator';

/**
 * QualityGateRegistry.ts
 * 
 * Development OS 全体で使用する QualityGate（品質判定）の不変レジストリ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum QualityGateState {
  CREATED = 'CREATED',
  EVALUATED = 'EVALUATED',
  PASSED = 'PASSED',
  FAILED = 'FAILED'
}

export interface QualityGateRecord {
  readonly gateId: string;
  readonly gateVersion: string;
  readonly description: string;
  readonly ledgerId: string;
  readonly criticalCount: number;
  readonly majorCount: number;
  readonly minorCount: number;
  readonly passed: boolean;
  readonly evaluationState: QualityGateState;
  readonly evaluationSummary: string;
  readonly ruleVersion: string;
  readonly auditSource: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly version: string;
}

export interface RegistryMetadata {
  readonly registryId: string;
  readonly registryVersion: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export class QualityGateRegistry {
  private static registry: Map<string, QualityGateRecord> = new Map();

  // レジストリメタデータの定義
  public static readonly metadata: RegistryMetadata = Object.freeze({
    registryId: 'reg-gate-01',
    registryVersion: '1.0.0',
    createdAt: new Date('2026-07-09T09:30:00Z').toISOString(),
    updatedAt: new Date('2026-07-09T09:30:00Z').toISOString()
  });

  /**
   * QualityGateRecord を登録する
   */
  static register(record: QualityGateRecord): void {
    if (!record) {
      throw new Error('[QualityGateRegistry] Record cannot be empty');
    }
    if (!record.gateId) {
      throw new Error('[QualityGateRegistry] gateId is required');
    }

    if (this.registry.has(record.gateId)) {
      throw new Error(`[QualityGateRegistry] Record ID already registered: ${record.gateId}`);
    }

    // 検証
    QualityGateValidator.validate(record);

    this.registry.set(record.gateId, Object.freeze({ ...record }));
  }

  /**
   * IDから Record を取得する
   */
  static get(gateId: string): QualityGateRecord | undefined {
    return this.registry.get(gateId);
  }

  /**
   * LedgerIDから Record を取得する
   */
  static getByLedger(ledgerId: string): QualityGateRecord | undefined {
    for (const record of this.registry.values()) {
      if (record.ledgerId === ledgerId) {
        return record;
      }
    }
    return undefined;
  }

  /**
   * 全 Record を取得する
   */
  static getAll(): QualityGateRecord[] {
    return Array.from(this.registry.values());
  }

  /**
   * 状態の完全置換アップデート（不変性の維持）
   */
  static updateState(
    gateId: string,
    newState: QualityGateState,
    criticalCount?: number,
    majorCount?: number,
    minorCount?: number
  ): void {
    const record = this.get(gateId);
    if (!record) {
      throw new Error(`[QualityGateRegistry] Record not found: ${gateId}`);
    }

    // 状態遷移検証
    QualityGateValidator.validateTransition(record.evaluationState, newState);

    const now = new Date().toISOString();
    const resolvedCritical = criticalCount !== undefined ? criticalCount : record.criticalCount;
    const resolvedMajor = majorCount !== undefined ? majorCount : record.majorCount;
    const resolvedMinor = minorCount !== undefined ? minorCount : record.minorCount;

    // EVALUATED ➔ PASSED/FAILED 時の合否判定
    let resolvedPassed = record.passed;
    if (newState === QualityGateState.PASSED) {
      resolvedPassed = true;
    } else if (newState === QualityGateState.FAILED) {
      resolvedPassed = false;
    } else if (newState === QualityGateState.EVALUATED) {
      resolvedPassed = (resolvedCritical === 0 && resolvedMajor === 0);
    }

    const evaluationSummary = `${resolvedCritical} Critical / ${resolvedMajor} Major / ${resolvedMinor} Minor`;

    const updatedRecord: QualityGateRecord = {
      ...record,
      criticalCount: resolvedCritical,
      majorCount: resolvedMajor,
      minorCount: resolvedMinor,
      passed: resolvedPassed,
      evaluationState: newState,
      evaluationSummary: evaluationSummary,
      updatedAt: now
    };

    // 再検証
    QualityGateValidator.validate(updatedRecord);

    this.registry.set(gateId, Object.freeze(updatedRecord));
  }

  /**
   * レジストリをクリアする（テスト用）
   */
  static clear(): void {
    this.registry.clear();
  }
}
