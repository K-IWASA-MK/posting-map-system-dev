import { AreaDetail, VoteTurnout, EventLogItem } from '../DashboardStateModel';

/**
 * GoogleMapsLayerManager.ts
 * 
 * Google Maps 上の各種レイヤー（Area, VoteTurnout, Activity, Marker）の
 * 描画・削除・更新処理を管理するクラス。
 */
export class GoogleMapsLayerManager {
  private map: any;
  private areaOverlays: Map<string, any> = new Map(); // areaId -> Circle (または Polygon)
  private turnoutOverlays: any[] = [];
  private activityOverlays: any[] = [];
  private generalMarkers: Map<string, any> = new Map(); // id -> Marker

  constructor(map: any) {
    this.map = map;
  }

  /**
   * エリアレイヤーの描画 (Area Layer)
   */
  updateAreaLayer(areas: readonly AreaDetail[], onAreaSelected: (areaId: string) => void): void {
    this.clearAreas();
    const google = (window as any).google;
    if (!google || !google.maps) return;

    areas.forEach(area => {
      // エリア進捗率に応じたヒートカラー設定
      let strokeColor = 'rgba(255, 255, 255, 0.2)'; // 未着手 (グレー)
      let fillColor = 'rgba(255, 255, 255, 0.05)';
      
      if (area.progressRate >= 100) {
        strokeColor = '#10b981'; // 完了 (緑)
        fillColor = 'rgba(16, 185, 129, 0.2)';
      } else if (area.progressRate > 0) {
        strokeColor = '#3b82f6'; // 進行中 (青)
        fillColor = 'rgba(59, 130, 246, 0.2)';
      }

      const circle = new google.maps.Circle({
        strokeColor: strokeColor,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: fillColor,
        fillOpacity: 0.35,
        map: this.map,
        center: { lat: area.latitude, lng: area.longitude },
        radius: 300 // 半径300メートル基準
      });

      // Click = Animation & Event Trigger
      google.maps.event.addListener(circle, 'click', () => {
        circle.setRadius(340);
        setTimeout(() => {
          circle.setRadius(300);
          onAreaSelected(area.areaId);
        }, 120);
      });

      this.areaOverlays.set(area.areaId, circle);
    });
  }

  /**
   * エリアハイライト処理
   */
  highlightArea(areaId: string): void {
    this.areaOverlays.forEach((overlay, id) => {
      if (id === areaId) {
        overlay.setOptions({
          strokeWeight: 4,
          strokeOpacity: 1.0,
          fillOpacity: 0.6
        });
      } else {
        overlay.setOptions({
          strokeWeight: 2,
          strokeOpacity: 0.8,
          fillOpacity: 0.35
        });
      }
    });
  }

  /**
   * エリアレイヤーのクリア
   */
  clearAreas(): void {
    this.areaOverlays.forEach(overlay => {
      overlay.setMap(null);
    });
    this.areaOverlays.clear();
  }

  /**
   * 投票率レイヤーの描画 (VoteTurnout Layer)
   * 地区の緯度経度にマッピングして可視化
   */
  updateVoteTurnoutLayer(turnouts: readonly VoteTurnout[], areas: readonly AreaDetail[]): void {
    this.clearVoteTurnoutLayer();
    const google = (window as any).google;
    if (!google || !google.maps) return;

    turnouts.forEach(t => {
      const area = areas.find(a => a.areaId === t.areaId);
      if (!area) return;

      // 投票率（%）に応じたサークル半径
      const circle = new google.maps.Circle({
        strokeColor: '#f59e0b', // 微発光オレンジ
        strokeOpacity: 0.6,
        strokeWeight: 1,
        fillColor: '#f59e0b',
        fillOpacity: 0.15,
        map: this.map,
        center: { lat: area.latitude, lng: area.longitude },
        radius: t.turnoutRate * 3
      });
      this.turnoutOverlays.push(circle);
    });
  }

  /**
   * 投票率レイヤーのクリア
   */
  clearVoteTurnoutLayer(): void {
    this.turnoutOverlays.forEach(overlay => {
      overlay.setMap(null);
    });
    this.turnoutOverlays = [];
  }

  /**
   * 活動証跡レイヤーの描画 (Activity Layer)
   */
  updateActivityLayer(logs: readonly EventLogItem[]): void {
    this.clearActivityLayer();
    const google = (window as any).google;
    if (!google || !google.maps) return;

    logs.forEach(log => {
      if (log.latitude === 0 && log.longitude === 0) return;

      const marker = new google.maps.Marker({
        position: { lat: log.latitude, lng: log.longitude },
        map: this.map,
        title: `${log.memberId}: ${log.count}枚`,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: '#3b82f6',
          fillOpacity: 0.8,
          strokeColor: '#ffffff',
          strokeWeight: 1.5
        }
      });
      this.activityOverlays.push(marker);
    });
  }

  /**
   * 活動証跡レイヤーのクリア
   */
  clearActivityLayer(): void {
    this.activityOverlays.forEach(overlay => {
      overlay.setMap(null);
    });
    this.activityOverlays = [];
  }

  /**
   * 汎用マーカーの追加 (Marker Layer)
   */
  addMarker(markerData: any): any {
    const google = (window as any).google;
    if (!google || !google.maps) return null;

    const id = markerData.id || `marker-${Date.now()}-${Math.random()}`;
    const marker = new google.maps.Marker({
      position: { lat: markerData.latitude, lng: markerData.longitude },
      map: this.map,
      title: markerData.title || ''
    });

    this.generalMarkers.set(id, marker);
    return marker;
  }

  /**
   * 汎用マーカーの削除 (Marker Layer)
   */
  removeMarker(id: string): void {
    const marker = this.generalMarkers.get(id);
    if (marker) {
      marker.setMap(null);
      this.generalMarkers.delete(id);
    }
  }

  /**
   * 汎用マーカーレイヤーのクリア (Marker Layer)
   */
  clearMarkerLayer(): void {
    this.generalMarkers.forEach(marker => {
      marker.setMap(null);
    });
    this.generalMarkers.clear();
  }

  /**
   * 破棄およびリソース解放
   */
  destroy(): void {
    this.clearAreas();
    this.clearVoteTurnoutLayer();
    this.clearActivityLayer();
    this.clearMarkerLayer();
    this.map = null;
  }
}
