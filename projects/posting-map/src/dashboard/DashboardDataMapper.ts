/**
 * DashboardDataMapper.ts
 * 
 * GAS API Response の JSON データをフロントエンドの表示用モデル（AreaDetail, VoteTurnout 等）へ
 * マッピング・正規化する変換レイヤー。
 */

import { AreaDetail, VoteTurnout, EventLogItem, InventoryItem, DashboardData } from './DashboardStateModel';
import {
  PublicDashboardDataViewModel,
  PublicDistrictViewModel,
  PublicMunicipalityViewModel,
  PublicTurnoutViewModel,
  PublicBranchStatusViewModel,
  PublicAssetStatusViewModel
} from './PublicDashboardViewModels';

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

  static mapPublicDistrict(raw: any): PublicDistrictViewModel {
    return {
      id: String(raw.id || ''),
      name: String(raw.name || ''),
      status: String(raw.status || 'unknown')
    };
  }

  static mapPublicMunicipality(raw: any): PublicMunicipalityViewModel {
    return {
      districtId: String(raw.districtId || ''),
      name: String(raw.name || ''),
      historyCount: Number(raw.historyCount || 0)
    };
  }

  static mapPublicTurnout(raw: any): PublicTurnoutViewModel {
    return {
      districtId: String(raw.districtId || ''),
      municipalityName: String(raw.municipalityName || ''),
      type: raw.type === 'HOUSE_OF_COUNCILLORS' ? 'HOUSE_OF_COUNCILLORS' : 'HOUSE_OF_REPRESENTATIVES',
      year: Number(raw.year || 0),
      turnout: Number(raw.turnout || 0)
    };
  }

  static mapPublicBranchStatus(raw: any): PublicBranchStatusViewModel {
    return {
      districtId: String(raw.districtId || ''),
      districtName: String(raw.districtName || ''),
      provisioningStatus: String(raw.provisioningStatus || ''),
      activationStatus: String(raw.activationStatus || ''),
      activatedAt: Number(raw.activatedAt || 0),
      lineCheck: String(raw.lineCheck || 'PENDING'),
      gasCheck: String(raw.gasCheck || 'PENDING')
    };
  }

  static mapPublicAssetStatus(raw: any): PublicAssetStatusViewModel {
    return {
      districtId: String(raw.districtId || ''),
      hasSpreadsheet: Boolean(raw.hasSpreadsheet),
      hasStorageFolder: Boolean(raw.hasStorageFolder),
      hasGasScript: Boolean(raw.hasGasScript)
    };
  }

  static mapPublicDashboardData(raw: any): PublicDashboardDataViewModel {
    const rawMetadata = raw.metadata || {};
    const rawLineage = raw.lineage || {};
    const rawDistricts = Array.isArray(raw.districts) ? raw.districts : [];
    const rawMunicipalities = Array.isArray(raw.municipalities) ? raw.municipalities : [];
    const rawTurnouts = Array.isArray(raw.turnoutComparison) ? raw.turnoutComparison : [];
    const rawBranchStatus = Array.isArray(raw.branchStatus) ? raw.branchStatus : [];
    const rawAssetStatus = Array.isArray(raw.assetStatus) ? raw.assetStatus : [];

    return {
      metadata: {
        generatedAt: String(rawMetadata.generatedAt || ''),
        schemaVersion: String(rawMetadata.schemaVersion || ''),
        executionId: String(rawMetadata.executionId || ''),
        presentationHash: String(rawMetadata.presentationHash || ''),
        deploymentUrl: rawMetadata.deploymentUrl ? String(rawMetadata.deploymentUrl) : undefined
      },
      lineage: {
        sourceHash: String(rawLineage.sourceHash || ''),
        outputHash: String(rawLineage.outputHash || '')
      },
      districts: Object.freeze(rawDistricts.map((d: any) => this.mapPublicDistrict(d))),
      municipalities: Object.freeze(rawMunicipalities.map((m: any) => this.mapPublicMunicipality(m))),
      turnoutComparison: Object.freeze(rawTurnouts.map((t: any) => this.mapPublicTurnout(t))),
      branchStatus: Object.freeze(rawBranchStatus.map((b: any) => this.mapPublicBranchStatus(b))),
      assetStatus: Object.freeze(rawAssetStatus.map((a: any) => this.mapPublicAssetStatus(a)))
    };
  }
}

