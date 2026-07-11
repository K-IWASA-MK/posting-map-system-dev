import { AreaDetail } from '../DashboardStateModel';

export type DistributionStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED';

export type DistributionStatusListener = (areaId: string, status: DistributionStatus) => void;

export class DistributionStatusManager {
  private readonly statusMap = new Map<string, DistributionStatus>();
  private readonly listeners: DistributionStatusListener[] = [];

  /**
   * 地区の配布ステータスを取得。設定されていない場合は AreaDetail 情報から自動判定。
   */
  getStatus(areaId: string, area?: AreaDetail): DistributionStatus {
    const manualStatus = this.statusMap.get(areaId);
    if (manualStatus) {
      return manualStatus;
    }

    if (!area) {
      return 'NOT_STARTED';
    }

    if (area.doneCount >= area.totalHouseholds) {
      return 'COMPLETED';
    } else if (area.doneCount > 0) {
      return 'IN_PROGRESS';
    }

    return 'NOT_STARTED';
  }

  /**
   * 手動で配布ステータスを変更（PAUSED や一時強制変更用）
   */
  setStatus(areaId: string, status: DistributionStatus): void {
    const prev = this.statusMap.get(areaId);
    if (prev !== status) {
      this.statusMap.set(areaId, status);
      this.notifyListeners(areaId, status);
    }
  }

  /**
   * 地区データを基にステータスを自動更新（手動上書きされている場合は維持）
   */
  updateFromArea(area: AreaDetail): void {
    const currentManual = this.statusMap.get(area.areaId);
    if (currentManual === 'PAUSED') {
      // PAUSED は維持
      return;
    }

    let calculated: DistributionStatus = 'NOT_STARTED';
    if (area.doneCount >= area.totalHouseholds) {
      calculated = 'COMPLETED';
    } else if (area.doneCount > 0) {
      calculated = 'IN_PROGRESS';
    }

    if (currentManual !== calculated) {
      this.statusMap.set(area.areaId, calculated);
      this.notifyListeners(area.areaId, calculated);
    }
  }

  subscribe(listener: DistributionStatusListener): () => void {
    this.listeners.push(listener);
    return () => {
      const idx = this.listeners.indexOf(listener);
      if (idx !== -1) {
        this.listeners.splice(idx, 1);
      }
    };
  }

  private notifyListeners(areaId: string, status: DistributionStatus): void {
    this.listeners.forEach(l => {
      try {
        l(areaId, status);
      } catch (err) {
        console.error('[DistributionStatusManager] Error in listener callback', err);
      }
    });
  }

  /**
   * 手動状態設定をクリアして自動判定に戻す
   */
  resetStatus(areaId: string): void {
    if (this.statusMap.has(areaId)) {
      this.statusMap.delete(areaId);
      this.notifyListeners(areaId, 'NOT_STARTED'); // 初期フォールバック通知
    }
  }
}
