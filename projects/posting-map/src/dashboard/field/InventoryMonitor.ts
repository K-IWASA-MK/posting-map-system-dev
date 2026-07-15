import { NotificationCenter } from '../operations/NotificationCenter';

export interface InventoryItem {
  readonly id: string;
  readonly remaining: number;
  readonly threshold: number;
  readonly isLowStock: boolean;
}

export type InventoryListener = (item: InventoryItem) => void;

export class InventoryMonitor {
  private readonly inventoryMap = new Map<string, InventoryItem>();
  private readonly notificationCenter?: NotificationCenter;
  private readonly listeners: InventoryListener[] = [];

  constructor(notificationCenter?: NotificationCenter) {
    this.notificationCenter = notificationCenter;
  }

  /**
   * チラシ残数の更新および低在庫の監視評価
   */
  updateInventory(id: string, remaining: number, threshold?: number): void {
    let finalThreshold: number;
    if (threshold !== undefined) {
      finalThreshold = threshold;
    } else {
      const globalConfig = typeof window !== 'undefined' ? (window as any).POSTING_MAP_CONFIG : null;
      finalThreshold = globalConfig?.SETTINGS?.INVENTORY_THRESHOLD ?? globalConfig?.INVENTORY_THRESHOLD ?? 100;
    }

    const isLowStock = remaining < finalThreshold;
    const prev = this.inventoryMap.get(id);

    const updatedItem: InventoryItem = {
      id,
      remaining,
      threshold: finalThreshold,
      isLowStock
    };

    this.inventoryMap.set(id, updatedItem);

    // 新たに警告ラインを下回った場合、またはさらに在庫が減少した場合に警告トーストを発行
    if (isLowStock && (!prev || !prev.isLowStock || remaining < prev.remaining)) {
      if (this.notificationCenter) {
        this.notificationCenter.addNotification(
          'Warning',
          `チラシ残数警告 [ID: ${id}] - 在庫残数が警告閾値を下回っています (残り: ${remaining} 枚 / 閾値: ${threshold} 枚)`
        );
      }
    }

    this.listeners.forEach(l => {
      try {
        l(updatedItem);
      } catch (err) {
        console.error('[InventoryMonitor] Error in listener callback', err);
      }
    });
  }

  getInventory(id: string): InventoryItem | undefined {
    return this.inventoryMap.get(id);
  }

  getAllInventory(): readonly InventoryItem[] {
    return Array.from(this.inventoryMap.values());
  }

  getLowStockCount(): number {
    let count = 0;
    this.inventoryMap.forEach(item => {
      if (item.isLowStock) count++;
    });
    return count;
  }

  subscribe(listener: InventoryListener): () => void {
    this.listeners.push(listener);
    return () => {
      const idx = this.listeners.indexOf(listener);
      if (idx !== -1) {
        this.listeners.splice(idx, 1);
      }
    };
  }
}
