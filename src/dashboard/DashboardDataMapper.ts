/**
 * DashboardDataMapper.ts
 * 
 * GAS API Response の JSON データをフロントエンドの表示用モデル（AreaDetail, VoteTurnout 等）へ
 * マッピング・正規化する変換レイヤー。
 */

import { AreaDetail, VoteTurnout, EventLogItem, InventoryItem, DashboardData } from './DashboardStateModel';

export class DashboardDataMapper {
  
  /**
   * エリア情報のマッピング
   */
  static mapArea(raw: any): AreaDetail {
    const total = Number(raw.totalHouseholds || raw.totalCount || raw.total || 0);
    const done = Number(raw.doneCount || raw.done || 0);
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;

    return {
      areaId: String(raw.areaId || raw.name || ''),
      areaName: String(raw.areaName || raw.name || ''),
      cityName: String(raw.cityName || ''),
      totalHouseholds: total,
      representativeAddress: String(raw.representativeAddress || raw.repAddress || ''),
      latitude: raw.latitude !== undefined && raw.latitude !== null ? Number(raw.latitude) : (raw.lat !== undefined ? Number(raw.lat) : 0),
      longitude: raw.longitude !== undefined && raw.longitude !== null ? Number(raw.longitude) : (raw.lng !== undefined ? Number(raw.lng) : 0),
      doneCount: done,
      progressRate: progress
    };
  }

  /**
   * 投票率マスタ情報のマッピング
   */
  static mapVoteTurnout(raw: any): VoteTurnout {
    return {
      areaId: String(raw.areaId || ''),
      electionId: String(raw.electionId || ''),
      electionType: raw.electionType === 'HOUSE_OF_COUNCILLORS' ? 'HOUSE_OF_COUNCILLORS' : 'HOUSE_OF_REPRESENTATIVES',
      electionDate: String(raw.electionDate || ''),
      turnoutRate: Number(raw.turnoutRate || 0),
      nationalAverage: Number(raw.nationalAverage || 0)
    };
  }

  /**
   * イベントログアイテムのマッピング
   */
  static mapEventLogItem(raw: any): EventLogItem {
    return {
      id: String(raw.id || ''),
      timestamp: Number(raw.timestamp || 0),
      tenantId: String(raw.tenantId || ''),
      branchId: String(raw.branchId || ''),
      areaId: String(raw.areaId || raw.blockId || ''),
      memberId: String(raw.memberId || raw.userId || ''),
      actionType: String(raw.actionType || ''),
      count: Number(raw.count || 0),
      latitude: raw.latitude !== undefined && raw.latitude !== null ? Number(raw.latitude) : (raw.lat !== undefined ? Number(raw.lat) : 0),
      longitude: raw.longitude !== undefined && raw.longitude !== null ? Number(raw.longitude) : (raw.lng !== undefined ? Number(raw.lng) : 0),
      meta: raw.meta ? (typeof raw.meta === 'string' ? JSON.parse(raw.meta) : raw.meta) : {}
    };
  }

  /**
   * チラシ在庫アイテムのマッピング
   */
  static mapInventoryItem(raw: any): InventoryItem {
    return {
      inventoryId: String(raw.inventoryId || ''),
      flyerId: String(raw.flyerId || ''),
      flyerName: String(raw.flyerName || ''),
      holderId: String(raw.holderId || ''),
      holderType: raw.holderType === 'HUB' ? 'HUB' : 'MEMBER',
      currentStock: Number(raw.currentStock || 0),
      lastUpdatedAt: Number(raw.lastUpdatedAt || 0)
    };
  }

  /**
   * ダッシュボード統合表示データのマッピング
   */
  static mapDashboardData(raw: any): DashboardData {
    const rawAreas = Array.isArray(raw.areas) ? raw.areas : [];
    const rawCities = Array.isArray(raw.cities) ? raw.cities : [];
    const rawStats = raw.stats || {};

    const areas = rawAreas.map((a: any) => this.mapArea(a));
    const cities = rawCities.map((c: any) => ({
      cityName: String(c.cityName || c.name || ''),
      doneCount: Number(c.doneCount || c.done || 0),
      totalCount: Number(c.totalCount || c.total || 0)
    }));

    const totalHouseholds = Number(rawStats.totalHouseholds || rawStats.total || 0);
    const totalCompleted = Number(rawStats.totalCompleted || rawStats.done || 0);
    const progressRate = totalHouseholds > 0 ? Math.round((totalCompleted / totalHouseholds) * 100) : 0;

    return {
      branchName: String(raw.branchName || ''),
      stats: {
        totalCompleted,
        totalHouseholds,
        progressRate
      },
      areas,
      cities
    };
  }
}
