/**
 * CacheManager.ts
 * 
 * ダッシュボード表示用データのメモリキャッシュを管理する。
 * 各種エンティティ（Dashboard, Area, VoteTurnout, Inventory, EventLog）に対して
 * TTL（有効期限）付きでキャッシュの保存・取得・無効化を制御する。
 * 有効期限設定（TTL）は window.POSTING_MAP_CONFIG.CACHE_TTL からの動的取得に対応。
 */

export interface CacheEntry<T = any> {
  readonly data: T;
  readonly expiresAt: number;
}

export class CacheManager {
  private cache = new Map<string, CacheEntry>();
  
  // デフォルトのTTL設定 (ミリ秒)
  private readonly defaultTtlMap: Record<string, number> = {
    dashboard: 60000,    // 1分
    area: 30000,         // 30秒
    voteTurnout: 300000, // 5分
    inventory: 30000,    // 30秒
    eventLog: 15000      // 15秒
  };

  /**
   * 特定のキャッシュキーのデータを取り出す。
   * 有効期限が切れている場合は null を返し、キャッシュを破棄する。
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      console.log(`[CacheManager] Cache expired for key: ${key}`);
      return null;
    }

    return entry.data as T;
  }

  /**
   * 特定のキャッシュキーにデータを保存する。
   * 引数で明示的に TTL が渡されない場合、 window.POSTING_MAP_CONFIG.CACHE_TTL またはデフォルト定義より TTL を算出する。
   */
  set<T>(key: string, data: T, customTtlMs?: number): void {
    const ttlMs = customTtlMs !== undefined ? customTtlMs : this.getTtlFromConfig(key);
    this.cache.set(key, {
      data: Object.freeze(data),
      expiresAt: Date.now() + ttlMs
    });
    console.log(`[CacheManager] Data cached for key: ${key} (TTL: ${ttlMs}ms)`);
  }

  /**
   * 特定のキャッシュキーのキャッシュを無効化（クリア）する
   */
  invalidate(key: string): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
      console.log(`[CacheManager] Invalidated cache for key: ${key}`);
    }
  }

  /**
   * すべてのキャッシュをクリアする
   */
  clear(): void {
    this.cache.clear();
    console.log('[CacheManager] All caches cleared.');
  }

  /**
   * 設定オブジェクトまたはデフォルトマップからTTLを取得する
   */
  private getTtlFromConfig(key: string): number {
    const category = this.resolveCategory(key);
    const globalConfig = typeof window !== 'undefined' ? (window as any).POSTING_MAP_CONFIG : null;
    const configTtl = globalConfig?.CACHE_TTL;

    if (configTtl && typeof configTtl[category] === 'number') {
      return configTtl[category];
    }

    return this.defaultTtlMap[category] || 60000;
  }

  /**
   * キー文字列からキャッシュカテゴリ（dashboard, area, voteTurnout など）を特定する
   */
  private resolveCategory(key: string): string {
    if (key.startsWith('dashboard:')) return 'dashboard';
    if (key.startsWith('area:')) return 'area';
    if (key.startsWith('voteTurnout:')) return 'voteTurnout';
    if (key.startsWith('inventory:')) return 'inventory';
    if (key.startsWith('eventLog:')) return 'eventLog';
    return key;
  }
}
