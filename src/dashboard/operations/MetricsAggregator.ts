import { CacheManager } from '../sync/CacheManager';
import { SynchronizationScheduler } from '../sync/SynchronizationScheduler';
import { ConflictResolver } from '../sync/ConflictResolver';

export interface AggregatedMetrics {
  // Cache Metrics
  readonly hitCount: number;
  readonly missCount: number;
  readonly hitRate: number;
  readonly cacheSize: number;
  readonly memoryUsageBytes: number;

  // Sync Metrics
  readonly lastSyncTime: number;
  readonly lastSyncDuration: number;
  readonly lastRetryCount: number;
  readonly totalSyncCount: number;
  readonly averageSyncTime: number;
  readonly maxSyncTime: number;
  readonly averageRetryCount: number;
  readonly totalOfflineDuration: number;

  // Conflict Metrics
  readonly conflictCount: number;
}

export class MetricsAggregator {
  private readonly cacheManager: CacheManager;
  private readonly scheduler: SynchronizationScheduler;
  private readonly conflictResolver: ConflictResolver;

  constructor(
    cacheManager: CacheManager,
    scheduler: SynchronizationScheduler,
    conflictResolver: ConflictResolver
  ) {
    this.cacheManager = cacheManager;
    this.scheduler = scheduler;
    this.conflictResolver = conflictResolver;
  }

  /**
   * 統合された全運用メトリクスを集約・返却する
   */
  getMetrics(): AggregatedMetrics {
    const cacheMetrics = this.cacheManager.getMetrics();
    const syncMetrics = this.scheduler.getMetrics();
    const conflictCount = this.conflictResolver.getConflictCount();

    return {
      hitCount: cacheMetrics.hitCount,
      missCount: cacheMetrics.missCount,
      hitRate: cacheMetrics.hitRate,
      cacheSize: cacheMetrics.cacheSize,
      memoryUsageBytes: cacheMetrics.memoryUsageBytes,

      lastSyncTime: syncMetrics.lastSyncTime,
      lastSyncDuration: syncMetrics.lastSyncDuration,
      lastRetryCount: syncMetrics.lastRetryCount,
      totalSyncCount: syncMetrics.totalSyncCount,
      averageSyncTime: syncMetrics.averageSyncTime,
      maxSyncTime: syncMetrics.maxSyncTime,
      averageRetryCount: syncMetrics.averageRetryCount,
      totalOfflineDuration: syncMetrics.totalOfflineDuration,

      conflictCount
    };
  }

  /**
   * 全モジュールの測定メトリクスを初期状態にリセットする
   */
  resetAllMetrics(): void {
    this.cacheManager.resetMetrics();
    this.conflictResolver.resetMetrics();
  }
}
