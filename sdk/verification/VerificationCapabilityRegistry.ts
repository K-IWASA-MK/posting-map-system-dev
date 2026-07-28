/**
 * VerificationCapabilityRegistry.ts
 * 
 * AIOS Verification Runtime Foundation - Capability Registry
 * 
 * AI社員の実行環境における検証能力の動的管理、検索、状態更新、スナップショット履歴管理を行う。
 * 
 * アーキテクチャ原則: Controlled State Management / Immutable Boundary
 * - 内部状態（Map / History）は安全に維持する。
 * - 外部へ引き渡すオブジェクトは常に Object.freeze された不変バウンダリを保証する。
 */

import {
  VerificationCapability,
  VerificationCapabilitySnapshot,
  VerificationCapabilityStatus,
  VerificationCapabilityType
} from './VerificationCapabilityModel';
import { VerificationCapabilityValidator } from './VerificationCapabilityValidator';
import { VerificationCapabilityFactory } from './VerificationCapabilityFactory';

export class VerificationCapabilityRegistry {
  private static registry: Map<string, VerificationCapability> = new Map();
  private static snapshotHistory: VerificationCapabilitySnapshot[] = [];

  /**
   * 単一の VerificationCapability を登録する
   * 重複 ID が存在する場合は Error をスローする
   */
  static register(capability: VerificationCapability): void {
    if (!capability) {
      throw new Error('[VerificationCapabilityRegistry] Capability cannot be empty');
    }

    if (!VerificationCapabilityValidator.validateCapability(capability)) {
      throw new Error('[VerificationCapabilityRegistry] Invalid capability structure');
    }

    if (this.registry.has(capability.id)) {
      throw new Error(`[VerificationCapabilityRegistry] Capability ID already registered: ${capability.id}`);
    }

    this.registry.set(capability.id, Object.freeze({ ...capability }));
  }

  /**
   * 複数の VerificationCapability を一括登録する
   */
  static registerMany(capabilities: readonly VerificationCapability[]): void {
    if (!Array.isArray(capabilities)) {
      throw new Error('[VerificationCapabilityRegistry] capabilities must be an array');
    }

    for (const cap of capabilities) {
      this.register(cap);
    }
  }

  /**
   * 既存 Capability のステータスおよびメタデータを更新する
   * 更新時に lastChecked タイムスタンプを自動的に現在時刻に再セットする
   */
  static updateStatus(
    id: string,
    status: VerificationCapabilityStatus,
    metadata?: Record<string, any>
  ): VerificationCapability {
    const existing = this.registry.get(id);
    if (!existing) {
      throw new Error(`[VerificationCapabilityRegistry] Capability not found: ${id}`);
    }

    const mergedMetadata = {
      ...(existing.metadata || {}),
      ...(metadata || {})
    };

    const updated = VerificationCapabilityFactory.createCapability({
      id: existing.id,
      type: existing.type,
      status,
      endpoint: existing.endpoint,
      permission: existing.permission,
      lastChecked: new Date().toISOString(),
      metadata: Object.keys(mergedMetadata).length > 0 ? mergedMetadata : undefined
    });

    this.registry.set(id, updated);
    return updated;
  }

  /**
   * ID から VerificationCapability を取得する
   */
  static get(id: string): VerificationCapability | undefined {
    return this.registry.get(id);
  }

  /**
   * 指定した Capabilities Type の一覧を取得する
   */
  static getByType(type: VerificationCapabilityType): readonly VerificationCapability[] {
    const results: VerificationCapability[] = [];
    for (const cap of this.registry.values()) {
      if (cap.type === type) {
        results.push(cap);
      }
    }
    return Object.freeze(results);
  }

  /**
   * 指定した Capabilities Status の一覧を取得する
   */
  static getByStatus(status: VerificationCapabilityStatus): readonly VerificationCapability[] {
    const results: VerificationCapability[] = [];
    for (const cap of this.registry.values()) {
      if (cap.status === status) {
        results.push(cap);
      }
    }
    return Object.freeze(results);
  }

  /**
   * 利用可能 (AVAILABLE) な Capability の一覧を取得する
   */
  static findAvailable(type?: VerificationCapabilityType): readonly VerificationCapability[] {
    const results: VerificationCapability[] = [];
    for (const cap of this.registry.values()) {
      if (cap.status === VerificationCapabilityStatus.AVAILABLE) {
        if (!type || cap.type === type) {
          results.push(cap);
        }
      }
    }
    return Object.freeze(results);
  }

  /**
   * 特定の能力種別・ステータスを満たす Capability の存在有無を判定する
   */
  static hasCapability(
    type: VerificationCapabilityType,
    status: VerificationCapabilityStatus = VerificationCapabilityStatus.AVAILABLE
  ): boolean {
    for (const cap of this.registry.values()) {
      if (cap.type === type && cap.status === status) {
        return true;
      }
    }
    return false;
  }

  /**
   * 登録されているすべての Capability を取得する
   */
  static getAll(): readonly VerificationCapability[] {
    return Object.freeze(Array.from(this.registry.values()));
  }

  /**
   * 現在の全能力から全体スナップショットを生成し履歴に記録する
   */
  static captureSnapshot(): VerificationCapabilitySnapshot {
    const capabilities = this.getAll();
    const snapshot = VerificationCapabilityFactory.createSnapshot({
      capabilities
    });

    this.snapshotHistory.push(snapshot);
    return snapshot;
  }

  /**
   * 最新のスナップショットを取得する
   */
  static getLatestSnapshot(): VerificationCapabilitySnapshot | undefined {
    if (this.snapshotHistory.length === 0) {
      return undefined;
    }
    return this.snapshotHistory[this.snapshotHistory.length - 1];
  }

  /**
   * スナップショット履歴の一覧を取得する
   */
  static getSnapshotHistory(): readonly VerificationCapabilitySnapshot[] {
    return Object.freeze([...this.snapshotHistory]);
  }

  /**
   * レジストリ状態および履歴をクリアする（テスト用・初期化用）
   */
  static clear(): void {
    this.registry.clear();
    this.snapshotHistory = [];
  }
}
