/**
 * DashboardStateModel.ts
 * 
 * ダッシュボードで利用するフロントエンド・データモデル、および
 * ローディング・エラー・表示データのリアクティブ状態管理モデルの定義・実装。
 */

import { DashboardApiClient } from './DashboardApiClient';
import { DashboardDataMapper } from './DashboardDataMapper';

export interface AreaDetail {
  readonly areaId: string;
  readonly areaName: string;
  readonly cityName: string;
  readonly totalHouseholds: number;
  readonly representativeAddress: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly doneCount: number;
  readonly progressRate: number;
}

export interface VoteTurnout {
  readonly areaId: string;
  readonly electionId: string;
  readonly electionType: 'HOUSE_OF_REPRESENTATIVES' | 'HOUSE_OF_COUNCILLORS';
  readonly electionDate: string;
  readonly turnoutRate: number;
  readonly nationalAverage: number;
}

export interface EventLogItem {
  readonly id: string;
  readonly timestamp: number;
  readonly tenantId: string;
  readonly branchId: string;
  readonly areaId: string;
  readonly memberId: string;
  readonly actionType: string;
  readonly count: number;
  readonly latitude: number;
  readonly longitude: number;
  readonly meta: Record<string, any>;
}

export interface InventoryItem {
  readonly inventoryId: string;
  readonly flyerId: string;
  readonly flyerName: string;
  readonly holderId: string;
  readonly holderType: 'MEMBER' | 'HUB';
  readonly currentStock: number;
  readonly lastUpdatedAt: number;
}

export interface CitySummary {
  readonly cityName: string;
  readonly doneCount: number;
  readonly totalCount: number;
}

export interface DashboardData {
  readonly branchName: string;
  readonly stats: {
    readonly totalCompleted: number;
    readonly totalHouseholds: number;
    readonly progressRate: number;
  };
  readonly areas: readonly AreaDetail[];
  readonly cities: readonly CitySummary[];
}

export class DashboardStateModel {
  private readonly client: DashboardApiClient;
  
  private data: DashboardData | null = null;
  private voteTurnouts: readonly VoteTurnout[] = [];
  private eventLogs: readonly EventLogItem[] = [];
  private inventories: readonly InventoryItem[] = [];

  private isLoading: boolean = false;
  private error: { code: string; message: string } | null = null;
  private lastFetchedAt: number = 0;

  // 状態変更通知用のリスナーコールバック配列
  private listeners: (() => void)[] = [];

  constructor(client: DashboardApiClient) {
    this.client = client;
  }

  // リスナー管理
  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  // Getters
  getData(): DashboardData | null {
    return this.data;
  }

  getVoteTurnouts(): readonly VoteTurnout[] {
    return this.voteTurnouts;
  }

  getEventLogs(): readonly EventLogItem[] {
    return this.eventLogs;
  }

  getInventories(): readonly InventoryItem[] {
    return this.inventories;
  }

  getIsLoading(): boolean {
    return this.isLoading;
  }

  getError(): { code: string; message: string } | null {
    return this.error;
  }

  getLastFetchedAt(): number {
    return this.lastFetchedAt;
  }

  /**
   * ダッシュボードの主要データを一括ロードする
   * 更新ガード: 前回の取得から10秒未満の場合は再取得を防止する
   */
  async loadDashboard(tenantId: string, branchId: string, force: boolean = false): Promise<void> {
    const now = Date.now();
    if (!force && now - this.lastFetchedAt < 10000 && this.data) {
      return; // ガード発動
    }

    this.isLoading = true;
    this.error = null;
    this.notify();

    const response = await this.client.getDashboard(tenantId, branchId);
    
    if (response.success && response.data) {
      try {
        this.data = DashboardDataMapper.mapDashboardData(response.data);
        this.lastFetchedAt = Date.now();
      } catch (err: any) {
        this.error = {
          code: 'INTERNAL_ERROR',
          message: `Mapping failed: ${err.message || String(err)}`
        };
      }
    } else {
      this.error = {
        code: response.error?.code || 'INTERNAL_ERROR',
        message: response.error?.message || 'Failed to fetch dashboard data.'
      };
    }

    this.isLoading = false;
    this.notify();
  }

  /**
   * 投票率マスタデータを取得する
   */
  async loadVoteTurnout(areaId?: string): Promise<void> {
    this.isLoading = true;
    this.error = null;
    this.notify();

    const response = await this.client.getVoteTurnout(areaId);

    if (response.success && response.data) {
      try {
        const rawTurnouts = Array.isArray(response.data.turnouts) ? response.data.turnouts : [];
        this.voteTurnouts = Object.freeze(rawTurnouts.map((t: any) => DashboardDataMapper.mapVoteTurnout(t)));
      } catch (err: any) {
        this.error = {
          code: 'INTERNAL_ERROR',
          message: `Mapping failed: ${err.message || String(err)}`
        };
      }
    } else {
      this.error = {
        code: response.error?.code || 'INTERNAL_ERROR',
        message: response.error?.message || 'Failed to fetch turnout history.'
      };
    }

    this.isLoading = false;
    this.notify();
  }

  /**
   * イベントログ実績データをロードする
   */
  async loadEventLogs(limit?: number, sinceTimestamp?: number): Promise<void> {
    this.isLoading = true;
    this.error = null;
    this.notify();

    const response = await this.client.getEventLog(limit, sinceTimestamp);

    if (response.success && response.data) {
      try {
        const rawLogs = Array.isArray(response.data.logs) ? response.data.logs : [];
        this.eventLogs = Object.freeze(rawLogs.map((l: any) => DashboardDataMapper.mapEventLogItem(l)));
      } catch (err: any) {
        this.error = {
          code: 'INTERNAL_ERROR',
          message: `Mapping failed: ${err.message || String(err)}`
        };
      }
    } else {
      this.error = {
        code: response.error?.code || 'INTERNAL_ERROR',
        message: response.error?.message || 'Failed to fetch event logs.'
      };
    }

    this.isLoading = false;
    this.notify();
  }

  /**
   * 在庫管理データを取得する
   */
  async loadInventory(memberId?: string): Promise<void> {
    this.isLoading = true;
    this.error = null;
    this.notify();

    const response = await this.client.getInventory(memberId);

    if (response.success && response.data) {
      try {
        const rawInventories = Array.isArray(response.data.inventories) ? response.data.inventories : [];
        this.inventories = Object.freeze(rawInventories.map((i: any) => DashboardDataMapper.mapInventoryItem(i)));
      } catch (err: any) {
        this.error = {
          code: 'INTERNAL_ERROR',
          message: `Mapping failed: ${err.message || String(err)}`
        };
      }
    } else {
      this.error = {
        code: response.error?.code || 'INTERNAL_ERROR',
        message: response.error?.message || 'Failed to fetch inventories.'
      };
    }

    this.isLoading = false;
    this.notify();
  }

  /**
   * 外部（H-App同期など）から直接イベントログを追加し、不変状態（Immutable）として状態を部分更新する。
   * 重複受信時は破棄し false を返す。正常に追加された場合は true を返す。
   */
  addIncomingEventLog(log: EventLogItem): boolean {
    // 1. 一意性のチェック (重複EventIDの破棄ポリシー)
    if (this.eventLogs.some(l => l.id === log.id)) {
      console.warn(`[DashboardStateModel] EventLog ID=${log.id} already exists. Skipping.`);
      return false;
    }

    // 2. イベントログリストの不変追加（最新順に先頭に追加）
    this.eventLogs = Object.freeze([log, ...this.eventLogs]);

    // 3. エリア情報および全体統計の不変（Immutable）再計算更新
    if (this.data) {
      const updatedAreas = this.data.areas.map(area => {
        if (area.areaId === log.areaId) {
          const newDoneCount = area.doneCount + log.count;
          const newProgressRate = area.totalHouseholds > 0
            ? Math.min(100, Math.round((newDoneCount / area.totalHouseholds) * 100))
            : 0;

          return {
            ...area,
            doneCount: newDoneCount,
            progressRate: newProgressRate
          };
        }
        return area;
      });

      const totalCompleted = this.data.stats.totalCompleted + log.count;
      const totalHouseholds = this.data.stats.totalHouseholds;
      const progressRate = totalHouseholds > 0
        ? Math.min(100, Math.round((totalCompleted / totalHouseholds) * 100))
        : 0;

      this.data = {
        ...this.data,
        stats: {
          totalCompleted,
          totalHouseholds,
          progressRate
        },
        areas: Object.freeze(updatedAreas)
      };
    }

    // 変更を通知
    this.notify();
    return true;
  }
}
