import { AdapterResolverValidator } from './AdapterResolverValidator';

/**
 * AdapterResolutionRegistry.ts
 * 
 * ToolAdapter 解決設定（ResolutionRecord）の不変レジストリ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum ResolutionPolicy {
  FIXED = 'FIXED',
  PREFERRED = 'PREFERRED',
  FALLBACK = 'FALLBACK',
  DISABLED = 'DISABLED'
}

export enum AdapterType {
  ANTIGRAVITY = 'ANTIGRAVITY',
  CLAUDE = 'CLAUDE',
  GEMINI = 'GEMINI',
  OPENAI = 'OPENAI'
}

export enum ResolutionState {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DEPRECATED = 'DEPRECATED',
  EXPERIMENTAL = 'EXPERIMENTAL'
}

export interface ResolutionRecord {
  readonly resolutionId: string;
  readonly capabilityId: string;
  readonly pipelineId: string;
  readonly adapterId: string;
  readonly adapterType: AdapterType;
  readonly priority: number;
  readonly resolutionPolicy: ResolutionPolicy;
  readonly resolutionReason: string;
  readonly resolutionState: ResolutionState;
  readonly version: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegistryMetadata {
  readonly registryId: string;
  readonly registryVersion: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export class AdapterResolutionRegistry {
  private static registry: Map<string, ResolutionRecord> = new Map();

  // レジストリメタデータの定義
  public static readonly metadata: RegistryMetadata = Object.freeze({
    registryId: 'reg-adapter-resolution-01',
    registryVersion: '1.0.0',
    createdAt: new Date('2026-07-09T09:30:00Z').toISOString(),
    updatedAt: new Date('2026-07-09T09:30:00Z').toISOString()
  });

  /**
   * ResolutionRecord を登録する
   */
  static register(record: ResolutionRecord): void {
    if (!record) {
      throw new Error('[AdapterResolutionRegistry] Record cannot be empty');
    }
    if (!record.resolutionId) {
      throw new Error('[AdapterResolutionRegistry] resolutionId is required');
    }

    // ID重複チェック
    if (this.registry.has(record.resolutionId)) {
      throw new Error(`[AdapterResolutionRegistry] Resolution ID already registered: ${record.resolutionId}`);
    }

    // バリデーション
    AdapterResolverValidator.validate(record);

    this.registry.set(record.resolutionId, Object.freeze({ ...record }));
  }

  /**
   * IDから ResolutionRecord を取得する
   */
  static get(resolutionId: string): ResolutionRecord | undefined {
    return this.registry.get(resolutionId);
  }

  /**
   * Capability ID に対応する全 ResolutionRecord を取得する
   */
  static getByCapability(capabilityId: string): ResolutionRecord[] {
    const list: ResolutionRecord[] = [];
    for (const item of this.registry.values()) {
      if (item.capabilityId === capabilityId) {
        list.push(item);
      }
    }
    return list;
  }

  /**
   * 全登録レコードを取得
   */
  static getAll(): ResolutionRecord[] {
    return Array.from(this.registry.values());
  }

  /**
   * レジストリをクリアする（テスト用）
   */
  static clear(): void {
    this.registry.clear();
  }
}
