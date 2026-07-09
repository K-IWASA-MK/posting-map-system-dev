import { RuntimeValidator } from './RuntimeValidator';

/**
 * RuntimeRegistry.ts
 * 
 * Development OS における実行コンテキストの状態および定義を一元管理する不変レジストリ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum RuntimeState {
  INITIALIZED = 'INITIALIZED',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  TERMINATED = 'TERMINATED',
  FAILED = 'FAILED'
}

export enum RuntimeMode {
  SIMULATION = 'SIMULATION',
  DEVELOPMENT = 'DEVELOPMENT',
  PRODUCTION = 'PRODUCTION'
}

export interface RuntimeRecord {
  readonly runtimeId: string;
  readonly runtimeName: string;
  readonly runtimeState: RuntimeState;
  readonly runtimeMode: RuntimeMode;
  readonly description: string;
  readonly version: string;
  readonly supportedPipelineIds: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegistryMetadata {
  readonly registryId: string;
  readonly registryVersion: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export class RuntimeRegistry {
  private static registry: Map<string, RuntimeRecord> = new Map();

  // レジストリメタデータの定義
  public static readonly metadata: RegistryMetadata = Object.freeze({
    registryId: 'reg-runtime-01',
    registryVersion: '1.0.0',
    createdAt: new Date('2026-07-09T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-07-09T10:00:00Z').toISOString()
  });

  /**
   * RuntimeRecord を登録する
   */
  static register(record: RuntimeRecord): void {
    if (!record) {
      throw new Error('[RuntimeRegistry] Record cannot be empty');
    }
    if (!record.runtimeId) {
      throw new Error('[RuntimeRegistry] runtimeId is required');
    }

    // ID重複チェック
    if (this.registry.has(record.runtimeId)) {
      throw new Error(`[RuntimeRegistry] RuntimeRecord ID already registered: ${record.runtimeId}`);
    }

    // バリデーションの実行
    RuntimeValidator.validate(record);

    // 完全な不変性を担保して格納
    this.registry.set(record.runtimeId, Object.freeze({
      ...record,
      supportedPipelineIds: Object.freeze([...record.supportedPipelineIds])
    }));
  }

  /**
   * IDから RuntimeRecord を取得する
   */
  static get(id: string): RuntimeRecord | undefined {
    return this.registry.get(id);
  }

  /**
   * Pipeline ID から関連する RuntimeRecord のリストを検索する
   */
  static findByPipeline(pipelineId: string): RuntimeRecord[] {
    const results: RuntimeRecord[] = [];
    for (const record of this.registry.values()) {
      if (record.supportedPipelineIds.includes(pipelineId)) {
        results.push(record);
      }
    }
    return results;
  }

  /**
   * すべての RuntimeRecord を取得する
   */
  static findAll(): RuntimeRecord[] {
    return Array.from(this.registry.values());
  }

  /**
   * レジストリをクリアする (テスト用)
   */
  static clear(): void {
    this.registry.clear();
  }
}
