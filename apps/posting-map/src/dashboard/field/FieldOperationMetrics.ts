import { DistributionStatusManager } from './DistributionStatusManager';
import { InventoryMonitor } from './InventoryMonitor';
import { GPSEvidenceMonitor } from './GPSEvidenceMonitor';
import { PhotoEvidenceMonitor } from './PhotoEvidenceMonitor';
import { DashboardStateModel } from '../DashboardStateModel';

export interface FieldMetricsSummary {
  readonly completedAreasCount: number;
  readonly activeMembersCount: number;
  readonly lowStockAlertsCount: number;
  readonly gpsCoverageRate: number;
  readonly photoCoverageRate: number;
}

export class FieldOperationMetrics {
  private readonly statusManager: DistributionStatusManager;
  private readonly inventoryMonitor: InventoryMonitor;
  private readonly gpsEvidenceMonitor: GPSEvidenceMonitor;
  private readonly photoEvidenceMonitor: PhotoEvidenceMonitor;
  private readonly stateModel: DashboardStateModel;

  constructor(
    statusManager: DistributionStatusManager,
    inventoryMonitor: InventoryMonitor,
    gpsEvidenceMonitor: GPSEvidenceMonitor,
    photoEvidenceMonitor: PhotoEvidenceMonitor,
    stateModel: DashboardStateModel
  ) {
    this.statusManager = statusManager;
    this.inventoryMonitor = inventoryMonitor;
    this.gpsEvidenceMonitor = gpsEvidenceMonitor;
    this.photoEvidenceMonitor = photoEvidenceMonitor;
    this.stateModel = stateModel;
  }

  /**
   * 現場運用全体のメトリクスサマリーを集計・取得する
   */
  getMetricsSummary(): FieldMetricsSummary {
    const areas = this.stateModel.getData()?.areas || [];
    const totalAreasCount = areas.length;

    // 1. 配布完了地区数
    let completedAreasCount = 0;
    areas.forEach(area => {
      if (this.statusManager.getStatus(area.areaId, area) === 'COMPLETED') {
        completedAreasCount++;
      }
    });

    // 2. アクティブメンバー数 (直近15分以内にGPS発信あり)
    const activeMembersCount = this.gpsEvidenceMonitor.getActiveMembersCount();

    // 3. 在庫警告件数 (Low Stock Alert)
    const lowStockAlertsCount = this.inventoryMonitor.getLowStockCount();

    // 4. GPSカバレッジ率 (アクティブメンバー数 / 総地区数 の簡易比率)
    const gpsCoverageRate = totalAreasCount > 0 
      ? Math.min(1.0, activeMembersCount / totalAreasCount) 
      : 0.0;

    // 5. 写真提出カバレッジ率 (写真提出のある地区数 / 総地区数)
    const photoCoverageRate = totalAreasCount > 0
      ? this.photoEvidenceMonitor.getCoveredAreasCount() / totalAreasCount
      : 0.0;

    return {
      completedAreasCount,
      activeMembersCount,
      lowStockAlertsCount,
      gpsCoverageRate,
      photoCoverageRate
    };
  }
}
