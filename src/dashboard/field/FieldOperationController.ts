import { DistributionStatusManager } from './DistributionStatusManager';
import { InventoryMonitor } from './InventoryMonitor';
import { GPSEvidenceMonitor } from './GPSEvidenceMonitor';
import { PhotoEvidenceMonitor } from './PhotoEvidenceMonitor';
import { FieldOperationMetrics } from './FieldOperationMetrics';
import { DashboardEventCoordinator } from '../DashboardEventCoordinator';
import { DashboardStateModel, EventLogItem } from '../DashboardStateModel';

/**
 * FieldOperationController.ts
 * 
 * 現場運用（Field Operation）全体を統制・調整するメインコントローラー。
 * 同期されたEventLog情報を各モニターへ配分し、UI用の現場更新イベントを発火します。
 */

export class FieldOperationController {
  readonly statusManager: DistributionStatusManager;
  readonly inventoryMonitor: InventoryMonitor;
  readonly gpsEvidenceMonitor: GPSEvidenceMonitor;
  readonly photoEvidenceMonitor: PhotoEvidenceMonitor;
  readonly metrics: FieldOperationMetrics;
  private readonly coordinator: DashboardEventCoordinator;
  private readonly stateModel: DashboardStateModel;

  constructor(
    statusManager: DistributionStatusManager,
    inventoryMonitor: InventoryMonitor,
    gpsEvidenceMonitor: GPSEvidenceMonitor,
    photoEvidenceMonitor: PhotoEvidenceMonitor,
    metrics: FieldOperationMetrics,
    coordinator: DashboardEventCoordinator,
    stateModel: DashboardStateModel
  ) {
    this.statusManager = statusManager;
    this.inventoryMonitor = inventoryMonitor;
    this.gpsEvidenceMonitor = gpsEvidenceMonitor;
    this.photoEvidenceMonitor = photoEvidenceMonitor;
    this.metrics = metrics;
    this.coordinator = coordinator;
    this.stateModel = stateModel;

    this.setupListeners();
  }

  private setupListeners(): void {
    // 1. 配布ステータス更新の通知
    this.statusManager.subscribe((areaId, status) => {
      this.coordinator.emit('distribution-updated', { areaId, status });
      this.coordinator.emit('field-status-changed', this.metrics.getMetricsSummary());
    });

    // 2. 在庫残数更新の通知
    this.inventoryMonitor.subscribe((item) => {
      this.coordinator.emit('inventory-updated', item);
      this.coordinator.emit('field-status-changed', this.metrics.getMetricsSummary());
    });

    // 3. GPS位置情報の更新
    this.gpsEvidenceMonitor.subscribe((record) => {
      this.coordinator.emit('gps-updated', record);
      this.coordinator.emit('field-status-changed', this.metrics.getMetricsSummary());
    });

    // 4. 写真提出の更新
    this.photoEvidenceMonitor.subscribe((record) => {
      this.coordinator.emit('photo-updated', record);
      this.coordinator.emit('field-status-changed', this.metrics.getMetricsSummary());
    });

    // 5. 状態モデルの変化に伴う、地区進捗（doneCount/totalHouseholds）の自動反映
    this.stateModel.subscribe(() => {
      const data = this.stateModel.getData();
      if (data && data.areas) {
        data.areas.forEach(area => {
          this.statusManager.updateFromArea(area);
        });
      }
      this.coordinator.emit('field-status-changed', this.metrics.getMetricsSummary());
    });
  }

  /**
   * 受信したログを解析し、GPS・写真・在庫の各現場モニターへ配分
   */
  processIncomingLog(log: EventLogItem): void {
    // GPS位置情報のプロット
    if (typeof log.latitude === 'number' && typeof log.longitude === 'number' && log.latitude !== 0 && log.longitude !== 0) {
      const accuracy = log.meta?.accuracy;
      this.gpsEvidenceMonitor.updateLocation(
        log.memberId,
        log.latitude,
        log.longitude,
        log.timestamp,
        accuracy
      );
    }

    // 写真エビデンスの追加
    const photoUrl = log.meta?.photoUrl || log.meta?.photo_url;
    if (photoUrl) {
      const photoId = log.meta?.photoId || `PHOTO-${log.id}`;
      this.photoEvidenceMonitor.addPhoto(
        photoId,
        log.memberId,
        log.areaId,
        photoUrl,
        log.timestamp
      );
    }

    // チラシ在庫残数の監視更新
    const remainingSheets = log.meta?.remainingSheets || log.meta?.remaining_sheets || log.meta?.remaining;
    if (typeof remainingSheets === 'number') {
      const flyerId = log.meta?.flyerId || `FLYER-${log.memberId}`;
      const threshold = log.meta?.lowStockThreshold || 100;
      this.inventoryMonitor.updateInventory(flyerId, remainingSheets, threshold);
    }
  }
}
