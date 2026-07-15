import { RuntimeContextValidator } from './RuntimeContextValidator';

/**
 * RuntimeContextRegistry.ts
 * 
 * Development OS におけるセッション実行コンテキストの状態および定義を一元管理する不変レジストリ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum RuntimeContextState {
  CREATED = 'CREATED',
  INITIALIZED = 'INITIALIZED',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  CLOSED = 'CLOSED',
  DISPOSED = 'DISPOSED'
}

export interface Context {
  readonly contextId: string;
  readonly contextName: string;
  readonly sessionId: string;
  readonly description: string;
  readonly contextVersion: string;
  readonly state: RuntimeContextState;
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

export class RuntimeContextRegistry {
  private static registry: Map<string, Context> = new Map();

  // レジストリメタデータの定義
  public static readonly metadata: RegistryMetadata = Object.freeze({
    registryId: 'reg-runtime-context-01',
    registryVersion: '1.0.0',
    createdAt: new Date('2026-07-09T10:15:00Z').toISOString(),
    updatedAt: new Date('2026-07-09T10:15:00Z').toISOString()
  });

  /**
   * Context を登録する
   */
  static register(context: Context): void {
    if (!context) {
      throw new Error('[RuntimeContextRegistry] Context cannot be empty');
    }
    if (!context.contextId) {
      throw new Error('[RuntimeContextRegistry] contextId is required');
    }
    if (!context.contextName) {
      throw new Error('[RuntimeContextRegistry] contextName is required');
    }

    // ID重複チェック
    if (this.registry.has(context.contextId)) {
      throw new Error(`[RuntimeContextRegistry] Context ID already registered: ${context.contextId}`);
    }

    // 名前重複チェック
    for (const item of this.registry.values()) {
      if (item.contextName === context.contextName) {
        throw new Error(`[RuntimeContextRegistry] Context Name already registered: ${context.contextName}`);
      }
    }

    // バリデーションの実行
    RuntimeContextValidator.validate(context);

    // 完全な不変性を担保して格納
    this.registry.set(context.contextId, Object.freeze({
      ...context
    }));
  }

  /**
   * IDから Context を取得する
   */
  static get(id: string): Context | undefined {
    return this.registry.get(id);
  }

  /**
   * Session ID から関連する Context のリストを検索する
   */
  static findBySession(sessionId: string): Context[] {
    const results: Context[] = [];
    for (const context of this.registry.values()) {
      if (context.sessionId === sessionId) {
        results.push(context);
      }
    }
    return results;
  }

  /**
   * すべての Context を取得する
   */
  static findAll(): Context[] {
    return Array.from(this.registry.values());
  }

  /**
   * レジストリをクリアする (テスト用)
   */
  static clear(): void {
    this.registry.clear();
  }
}
