import { GasConfigurationProvider } from './GasConfigurationProvider';

export class CacheServiceProvider {
  private static instance: CacheServiceProvider | null = null;
  private configProvider: GasConfigurationProvider;

  private constructor() {
    this.configProvider = GasConfigurationProvider.getInstance();
  }

  public static getInstance(): CacheServiceProvider {
    if (!CacheServiceProvider.instance) {
      CacheServiceProvider.instance = new CacheServiceProvider();
    }
    return CacheServiceProvider.instance;
  }

  /**
   * キーの共通名前空間プレフィックスの生成
   */
  public makeKey(tenantId: string, branchId: string, category: string): string {
    return `${tenantId}:${branchId}:${category}`;
  }

  public get(key: string): string | null {
    if (typeof CacheService !== 'undefined') {
      try {
        const cache = CacheService.getScriptCache();
        return cache.get(key);
      } catch (e) {
        // Fallback for non-GAS runtimes
      }
    }
    return null;
  }

  public put(key: string, value: string, ttlSeconds?: number): void {
    if (typeof CacheService !== 'undefined') {
      try {
        const cache = CacheService.getScriptCache();
        const expiry = ttlSeconds !== undefined ? ttlSeconds : this.configProvider.getCacheTTL();
        
        // GAS CacheService limitation: max TTL is 21600 seconds (6 hours)
        const safeExpiry = Math.min(expiry, 21600);
        cache.put(key, value, safeExpiry);
      } catch (e) {
        // Fallback
      }
    }
  }

  public remove(key: string): void {
    if (typeof CacheService !== 'undefined') {
      try {
        const cache = CacheService.getScriptCache();
        cache.remove(key);
      } catch (e) {
        // Fallback
      }
    }
  }

  public invalidateAll(): void {
    // GAS ScriptCache has no clearAll. It will expire or keys must be removed individually.
  }
}

// Global declaration for GAS type safety during compiler checks
declare const CacheService: any;
