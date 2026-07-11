import { MapEngine } from './MapEngine';
import { AreaDetail } from '../DashboardStateModel';
import { GoogleMapsScriptLoader } from './GoogleMapsScriptLoader';
import { GoogleMapsConfiguration } from './GoogleMapsConfiguration';
import { GoogleMapsCameraController } from './GoogleMapsCameraController';
import { GoogleMapsLayerManager } from './GoogleMapsLayerManager';

/**
 * GoogleMapsEngine.ts
 * 
 * MapEngine インターフェースを実装した Standard Edition 用の Google Maps API アダプター。
 */
export class GoogleMapsEngine implements MapEngine {
  private map: any | null = null;
  private cameraController: GoogleMapsCameraController | null = null;
  private layerManager: GoogleMapsLayerManager | null = null;
  private onAreaSelectedCallback: ((areaId: string) => void) | null = null;

  constructor(onAreaSelected?: (areaId: string) => void) {
    if (onAreaSelected) {
      this.onAreaSelectedCallback = onAreaSelected;
    }
  }

  /**
   * 地図エンジンの初期化
   */
  initialize(container: HTMLDivElement): void {
    this.initializeAsync(container).catch(err => {
      console.error('[GoogleMapsEngine] Async map initialization failed:', err);
    });
  }

  private async initializeAsync(container: HTMLDivElement): Promise<void> {
    const apiKey = GoogleMapsConfiguration.getApiKey();
    if (!apiKey) {
      console.warn('[GoogleMapsEngine] API key is missing. Dynamic loading skipped.');
      container.innerHTML = `
        <div style="color: rgba(255, 255, 255, 0.4); font-size: 13px; text-align: center; margin: auto; padding: 24px; font-family: Inter, sans-serif;">
          Google Maps API Key が設定されていません。
        </div>
      `;
      return;
    }

    try {
      // 1. スクリプトの動的ロード実行 (重複防止)
      await GoogleMapsScriptLoader.load(apiKey);

      const google = (window as any).google;
      if (!google || !google.maps) {
        throw new Error('google.maps namespace is not defined after script load.');
      }

      // 2. 設定情報の取得
      const center = GoogleMapsConfiguration.getDefaultCenter();
      const zoom = GoogleMapsConfiguration.getDefaultZoom();
      const styles = GoogleMapsConfiguration.getDarkMapStyle();
      const gestureHandling = GoogleMapsConfiguration.getGestureHandling();

      // 3. 地図オブジェクトの作成
      this.map = new google.maps.Map(container, {
        center: center,
        zoom: zoom,
        styles: styles,
        gestureHandling: gestureHandling,
        disableDefaultUI: true,
        zoomControl: true
      });

      // 4. 下位コントローラーの初期化
      this.cameraController = new GoogleMapsCameraController(this.map);
      this.layerManager = new GoogleMapsLayerManager(this.map);

    } catch (error: any) {
      console.error('[GoogleMapsEngine] Error initializing maps:', error);
      container.innerHTML = `
        <div style="color: #ef4444; font-size: 13px; text-align: center; margin: auto; padding: 24px; font-family: Inter, sans-serif;">
          Google Maps の読み込みに失敗しました。
        </div>
      `;
    }
  }

  /**
   * リソース破棄
   */
  destroy(): void {
    if (this.cameraController) {
      this.cameraController.destroy();
      this.cameraController = null;
    }
    if (this.layerManager) {
      this.layerManager.destroy();
      this.layerManager = null;
    }
    this.map = null;
    this.onAreaSelectedCallback = null;
  }

  /**
   * エリア一覧の表示
   */
  showAreas(areas: readonly AreaDetail[]): void {
    if (!this.layerManager) return;

    this.layerManager.updateAreaLayer(areas, (areaId) => {
      if (this.onAreaSelectedCallback) {
        this.onAreaSelectedCallback(areaId);
      }
    });

    // 初期起動時に対象エリアが全て収まるようにカメラ画角を調整 (Fit Bounds)
    if (areas.length > 0 && this.cameraController) {
      const google = (window as any).google;
      if (google && google.maps) {
        const bounds = new google.maps.LatLngBounds();
        areas.forEach(a => {
          bounds.extend(new google.maps.LatLng(a.latitude, a.longitude));
        });
        this.cameraController.fitBounds(bounds);
      }
    }
  }

  /**
   * 特定エリアの強調
   */
  highlightArea(areaId: string): void {
    if (this.layerManager) {
      this.layerManager.highlightArea(areaId);
    }
  }

  /**
   * カメラの移動
   */
  moveCamera(latitude: number, longitude: number): void {
    if (this.cameraController) {
      this.cameraController.moveCamera(latitude, longitude);
    }
  }

  /**
   * 汎用ピンの追加
   */
  addMarker(marker: any): void {
    if (this.layerManager) {
      this.layerManager.addMarker(marker);
    }
  }

  /**
   * 汎用ピンの削除
   */
  removeMarker(markerId: string): void {
    if (this.layerManager) {
      this.layerManager.removeMarker(markerId);
    }
  }

  /**
   * 特定レイヤーの個別更新
   */
  updateLayer(layerId: string, options: any): void {
    if (!this.layerManager) return;

    switch (layerId) {
      case 'AreaLayer':
      case 'area':
        if (options && options.areas) {
          this.layerManager.updateAreaLayer(options.areas, (areaId) => {
            if (this.onAreaSelectedCallback) {
              this.onAreaSelectedCallback(areaId);
            }
          });
        }
        break;

      case 'VoteTurnoutLayer':
      case 'voteTurnout':
        if (options && options.turnouts && options.areas) {
          this.layerManager.updateVoteTurnoutLayer(options.turnouts, options.areas);
        }
        break;

      case 'ActivityLayer':
      case 'activity':
        if (options && options.logs) {
          this.layerManager.updateActivityLayer(options.logs);
        }
        break;

      default:
        console.warn(`[GoogleMapsEngine] Unsupported layer action: ${layerId}`);
    }
  }
}
