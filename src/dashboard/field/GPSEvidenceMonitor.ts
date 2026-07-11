export interface GPSRecord {
  readonly memberId: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly timestamp: number;
  readonly accuracy?: number;
}

export type GPSListener = (record: GPSRecord) => void;

export class GPSEvidenceMonitor {
  private static readonly MAX_GPS_HISTORY = 100;
  private readonly latestGPSMap = new Map<string, GPSRecord>();
  private readonly historyGPSMap = new Map<string, GPSRecord[]>();
  private readonly listeners: GPSListener[] = [];

  /**
   * 配布員の位置情報の更新
   */
  updateLocation(memberId: string, latitude: number, longitude: number, timestamp: number, accuracy?: number): void {
    const record: GPSRecord = {
      memberId,
      latitude,
      longitude,
      timestamp,
      accuracy
    };

    this.latestGPSMap.set(memberId, record);

    // 軌跡ヒストリ蓄積およびメモリ枯渇防止上限(MAX 100)の適用
    const history = this.historyGPSMap.get(memberId) || [];
    history.push(record);
    if (history.length > GPSEvidenceMonitor.MAX_GPS_HISTORY) {
      history.shift();
    }
    this.historyGPSMap.set(memberId, history);

    this.listeners.forEach(l => {
      try {
        l(record);
      } catch (err) {
        console.error('[GPSEvidenceMonitor] Error in listener callback', err);
      }
    });
  }

  getLocation(memberId: string): GPSRecord | undefined {
    return this.latestGPSMap.get(memberId);
  }

  getHistory(memberId: string): readonly GPSRecord[] {
    return this.historyGPSMap.get(memberId) || [];
  }

  getAllLocations(): readonly GPSRecord[] {
    return Array.from(this.latestGPSMap.values());
  }

  /**
   * 現在稼働中とみなされるアクティブな配布員数をカウント (直近15分以内にGPS信号あり)
   */
  getActiveMembersCount(thresholdMs = 15 * 60 * 1000): number {
    const now = Date.now();
    let count = 0;
    this.latestGPSMap.forEach(record => {
      if (now - record.timestamp <= thresholdMs) {
        count++;
      }
    });
    return count;
  }

  subscribe(listener: GPSListener): () => void {
    this.listeners.push(listener);
    return () => {
      const idx = this.listeners.indexOf(listener);
      if (idx !== -1) {
        this.listeners.splice(idx, 1);
      }
    };
  }
}
