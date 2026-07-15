import { RuntimeSessionValidator } from './RuntimeSessionValidator';

/**
 * RuntimeSessionRegistry.ts
 * 
 * Development OS における実行セッションの状態および定義を一元管理する不変レジストリ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum RuntimeSessionState {
  CREATED = 'CREATED',
  READY = 'READY',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  TERMINATED = 'TERMINATED'
}

export interface Session {
  readonly sessionId: string;
  readonly sessionName: string;
  readonly runtimeId: string;
  readonly description: string;
  readonly sessionVersion: string;
  readonly state: RuntimeSessionState;
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

export class RuntimeSessionRegistry {
  private static registry: Map<string, Session> = new Map();

  // レジストリメタデータの定義
  public static readonly metadata: RegistryMetadata = Object.freeze({
    registryId: 'reg-runtime-session-01',
    registryVersion: '1.0.0',
    createdAt: new Date('2026-07-09T10:10:00Z').toISOString(),
    updatedAt: new Date('2026-07-09T10:10:00Z').toISOString()
  });

  /**
   * Session を登録する
   */
  static register(session: Session): void {
    if (!session) {
      throw new Error('[RuntimeSessionRegistry] Session cannot be empty');
    }
    if (!session.sessionId) {
      throw new Error('[RuntimeSessionRegistry] sessionId is required');
    }
    if (!session.sessionName) {
      throw new Error('[RuntimeSessionRegistry] sessionName is required');
    }

    // ID重複チェック
    if (this.registry.has(session.sessionId)) {
      throw new Error(`[RuntimeSessionRegistry] Session ID already registered: ${session.sessionId}`);
    }

    // 名前重複チェック
    for (const item of this.registry.values()) {
      if (item.sessionName === session.sessionName) {
        throw new Error(`[RuntimeSessionRegistry] Session Name already registered: ${session.sessionName}`);
      }
    }

    // バリデーションの実行
    RuntimeSessionValidator.validate(session);

    // 完全な不変性を担保して格納
    this.registry.set(session.sessionId, Object.freeze({
      ...session
    }));
  }

  /**
   * IDから Session を取得する
   */
  static get(id: string): Session | undefined {
    return this.registry.get(id);
  }

  /**
   * Runtime ID から関連する Session のリストを検索する
   */
  static findByRuntime(runtimeId: string): Session[] {
    const results: Session[] = [];
    for (const session of this.registry.values()) {
      if (session.runtimeId === runtimeId) {
        results.push(session);
      }
    }
    return results;
  }

  /**
   * すべての Session を取得する
   */
  static findAll(): Session[] {
    return Array.from(this.registry.values());
  }

  /**
   * レジストリをクリアする (テスト用)
   */
  static clear(): void {
    this.registry.clear();
  }
}
