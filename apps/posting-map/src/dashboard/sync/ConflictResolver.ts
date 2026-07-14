import { AreaDetail, EventLogItem, InventoryItem } from '../DashboardStateModel';

/**
 * ConflictResolver.ts
 * 
 * 同時ロード・部分同期時のデータ競合（Conflict）をマージ・解決する。
 * 将来の AIOS 連携を見据え、マージ処理は Strategy パターンを採用し、動的なルール変更を可能とする。
 */

export interface AreaMergeStrategy {
  merge(current: AreaDetail, incoming: AreaDetail): AreaDetail;
}

export interface EventLogMergeStrategy {
  merge(current: readonly EventLogItem[], incoming: EventLogItem[]): readonly EventLogItem[];
}

export interface InventoryMergeStrategy {
  merge(current: InventoryItem, incoming: InventoryItem): InventoryItem;
}

/**
 * デフォルトの地区マージルール: doneCount のデグレードを完全に防止する (打刻優先・値の大きい方を採用)
 */
export class DefaultAreaMergeStrategy implements AreaMergeStrategy {
  merge(current: AreaDetail, incoming: AreaDetail): AreaDetail {
    const doneCount = Math.max(current.doneCount, incoming.doneCount);
    const progressRate = current.totalHouseholds > 0
      ? Math.min(100, Math.round((doneCount / current.totalHouseholds) * 100))
      : 0;

    return {
      ...incoming,
      doneCount,
      progressRate
    };
  }
}

/**
 * デフォルトのログマージルール: EventID の重複を排除し、最新順（タイムスタンプ降順）にソート
 */
export class DefaultEventLogMergeStrategy implements EventLogMergeStrategy {
  merge(current: readonly EventLogItem[], incoming: EventLogItem[]): readonly EventLogItem[] {
    const seen = new Set<string>();
    const merged: EventLogItem[] = [];

    // 新着データを優先登録
    incoming.forEach(log => {
      if (!seen.has(log.id)) {
        seen.add(log.id);
        merged.push(log);
      }
    });

    // 既存データを登録
    current.forEach(log => {
      if (!seen.has(log.id)) {
        seen.add(log.id);
        merged.push(log);
      }
    });

    return Object.freeze(merged.sort((a, b) => b.timestamp - a.timestamp));
  }
}

/**
 * デフォルトの在庫マージルール: 最終更新時刻（lastUpdatedAt）が新しい方を採用
 */
export class DefaultInventoryMergeStrategy implements InventoryMergeStrategy {
  merge(current: InventoryItem, incoming: InventoryItem): InventoryItem {
    return incoming.lastUpdatedAt >= current.lastUpdatedAt ? incoming : current;
  }
}

export class ConflictResolver {
  private areaStrategy: AreaMergeStrategy = new DefaultAreaMergeStrategy();
  private eventLogStrategy: EventLogMergeStrategy = new DefaultEventLogMergeStrategy();
  private inventoryStrategy: InventoryMergeStrategy = new DefaultInventoryMergeStrategy();

  private conflictCount = 0;

  /**
   * 地区マージ戦略を差し替える
   */
  setAreaMergeStrategy(strategy: AreaMergeStrategy): void {
    this.areaStrategy = strategy;
  }

  /**
   * イベントログマージ戦略を差し替える
   */
  setEventLogMergeStrategy(strategy: EventLogMergeStrategy): void {
    this.eventLogStrategy = strategy;
  }

  /**
   * チラシ在庫マージ戦略を差し替える
   */
  setInventoryMergeStrategy(strategy: InventoryMergeStrategy): void {
    this.inventoryStrategy = strategy;
  }

  /**
   * 競合検出回数を取得する
   */
  getConflictCount(): number {
    return this.conflictCount;
  }

  /**
   * メトリクスのリセット
   */
  resetMetrics(): void {
    this.conflictCount = 0;
  }

  /**
   * 既存の地区情報と受信した新規地区情報をマージ（不変構造）
   */
  mergeAreas(current: readonly AreaDetail[], incoming: AreaDetail[]): readonly AreaDetail[] {
    return Object.freeze(current.map(curArea => {
      const incArea = incoming.find(a => a.areaId === curArea.areaId);
      if (!incArea) return curArea;
      if (curArea.doneCount !== incArea.doneCount) {
        this.conflictCount++;
      }
      return this.areaStrategy.merge(curArea, incArea);
    }));
  }

  /**
   * 既存のイベントログと受信した新規イベントログをマージ（不変構造）
   */
  mergeEventLogs(current: readonly EventLogItem[], incoming: EventLogItem[]): readonly EventLogItem[] {
    return this.eventLogStrategy.merge(current, incoming);
  }

  /**
   * 既存のチラシ在庫と受信した新規チラシ在庫をマージ（不変構造）
   */
  mergeInventories(current: readonly InventoryItem[], incoming: InventoryItem[]): readonly InventoryItem[] {
    const merged: InventoryItem[] = [];
    const incomingMap = new Map(incoming.map(i => [i.inventoryId, i]));

    current.forEach(curItem => {
      const incItem = incomingMap.get(curItem.inventoryId);
      if (!incItem) {
        merged.push(curItem);
      } else {
        if (curItem.currentStock !== incItem.currentStock) {
          this.conflictCount++;
        }
        merged.push(this.inventoryStrategy.merge(curItem, incItem));
        incomingMap.delete(curItem.inventoryId);
      }
    });

    incomingMap.forEach(incItem => {
      merged.push(incItem);
    });

    return Object.freeze(merged);
  }
}
