/**
 * CapabilityRegistry.ts
 * 
 * Development OS 全体で使用する Capability（開発能力）の不変レジストリ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum CapabilityStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DEPRECATED = 'DEPRECATED',
  EXPERIMENTAL = 'EXPERIMENTAL'
}

export enum CapabilityCategory {
  Architecture = 'Architecture',
  Planning = 'Planning',
  Implementation = 'Implementation',
  Testing = 'Testing',
  Review = 'Review',
  Debugging = 'Debugging',
  Documentation = 'Documentation',
  Release = 'Release'
}

export interface Capability {
  readonly capabilityId: string;
  readonly capabilityName: string;
  readonly category: CapabilityCategory;
  readonly description: string;
  readonly priority: number;
  readonly status: CapabilityStatus;
  readonly version: string;
}

export interface RegistryMetadata {
  readonly registryId: string;
  readonly registryVersion: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export class CapabilityRegistry {
  private static registry: Map<string, Capability> = new Map();

  // レジストリメタデータの定義
  public static readonly metadata: RegistryMetadata = Object.freeze({
    registryId: 'reg-cap-01',
    registryVersion: '1.0.0',
    createdAt: new Date('2026-07-09T09:30:00Z').toISOString(),
    updatedAt: new Date('2026-07-09T09:30:00Z').toISOString()
  });

  /**
   * Capability を登録する
   */
  static register(capability: Capability): void {
    if (!capability) {
      throw new Error('[CapabilityRegistry] Capability cannot be empty');
    }
    if (!capability.capabilityId) {
      throw new Error('[CapabilityRegistry] capabilityId is required');
    }
    if (!capability.capabilityName) {
      throw new Error('[CapabilityRegistry] capabilityName is required');
    }

    if (this.registry.has(capability.capabilityId)) {
      throw new Error(`[CapabilityRegistry] Capability ID already registered: ${capability.capabilityId}`);
    }

    // 名前重複チェック
    for (const cap of this.registry.values()) {
      if (cap.capabilityName === capability.capabilityName) {
        throw new Error(`[CapabilityRegistry] Capability Name already registered: ${capability.capabilityName}`);
      }
    }

    this.registry.set(capability.capabilityId, Object.freeze({ ...capability }));
  }

  /**
   * IDから Capability を取得する
   */
  static get(capabilityId: string): Capability | undefined {
    return this.registry.get(capabilityId);
  }

  /**
   * 一致する CapabilityName を持つものを取得する
   */
  static getByName(name: string): Capability | undefined {
    for (const cap of this.registry.values()) {
      if (cap.capabilityName === name) {
        return cap;
      }
    }
    return undefined;
  }

  /**
   * 全 Capability を取得する
   */
  static getAll(): Capability[] {
    return Array.from(this.registry.values());
  }

  /**
   * レジストリをクリアする（テスト用）
   */
  static clear(): void {
    this.registry.clear();
  }
}
