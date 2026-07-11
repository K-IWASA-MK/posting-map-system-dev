/**
 * GoogleMapsCameraController.ts
 * 
 * Google Maps のカメラ操作（ズーム、パン、中心変更、画角フィット）を管理するクラス。
 */
export class GoogleMapsCameraController {
  private map: any | null = null;

  constructor(map: any) {
    this.map = map;
  }

  /**
   * 指定した緯度経度にスムーズに移動する
   */
  moveCamera(latitude: number, longitude: number, zoom?: number): void {
    if (!this.map) return;

    const google = (window as any).google;
    if (google && google.maps) {
      const target = new google.maps.LatLng(latitude, longitude);
      this.map.panTo(target);

      if (typeof zoom === 'number') {
        this.map.setZoom(zoom);
      }
    }
  }

  /**
   * 指定した座標範囲（LatLngBounds）に画角を自動フィットさせる
   */
  fitBounds(bounds: any): void {
    if (!this.map || !bounds) return;
    this.map.fitBounds(bounds);
  }

  /**
   * 破棄処理
   */
  destroy(): void {
    this.map = null;
  }
}
