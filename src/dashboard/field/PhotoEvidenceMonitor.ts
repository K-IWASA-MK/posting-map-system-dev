export interface PhotoRecord {
  readonly photoId: string;
  readonly memberId: string;
  readonly areaId: string;
  readonly photoUrl: string;
  readonly timestamp: number;
}

export type PhotoListener = (record: PhotoRecord) => void;

export class PhotoEvidenceMonitor {
  // areaId -> PhotoRecord[]
  private readonly areaPhotosMap = new Map<string, PhotoRecord[]>();
  private readonly listeners: PhotoListener[] = [];

  /**
   * 写真証跡データの追加
   */
  addPhoto(photoId: string, memberId: string, areaId: string, photoUrl: string, timestamp: number): void {
    const record: PhotoRecord = {
      photoId,
      memberId,
      areaId,
      photoUrl,
      timestamp
    };

    const list = this.areaPhotosMap.get(areaId) || [];
    // 重複登録の排除
    if (!list.some(p => p.photoId === photoId)) {
      list.push(record);
      // 時系列ソート
      list.sort((a, b) => b.timestamp - a.timestamp);
      this.areaPhotosMap.set(areaId, list);
    }

    this.listeners.forEach(l => {
      try {
        l(record);
      } catch (err) {
        console.error('[PhotoEvidenceMonitor] Error in listener callback', err);
      }
    });
  }

  /**
   * 該当地区における最新の写真証跡を取得
   */
  getLatestPhoto(areaId: string): PhotoRecord | undefined {
    const list = this.areaPhotosMap.get(areaId);
    return list && list.length > 0 ? list[0] : undefined;
  }

  getPhotos(areaId: string): readonly PhotoRecord[] {
    return this.areaPhotosMap.get(areaId) || [];
  }

  /**
   * 写真証跡が存在するユニークな地区数を取得 (写真カバレッジ算出用)
   */
  getCoveredAreasCount(): number {
    return this.areaPhotosMap.size;
  }

  subscribe(listener: PhotoListener): () => void {
    this.listeners.push(listener);
    return () => {
      const idx = this.listeners.indexOf(listener);
      if (idx !== -1) {
        this.listeners.splice(idx, 1);
      }
    };
  }
}
