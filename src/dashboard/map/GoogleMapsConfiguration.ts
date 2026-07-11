/**
 * GoogleMapsConfiguration.ts
 * 
 * Google Maps 用の設定管理・プロバイダークラス。
 * window.POSTING_MAP_CONFIG から API キー等を安全にロードする。
 */
export class GoogleMapsConfiguration {
  private static getConfig(): any {
    return typeof window !== 'undefined' ? (window as any).POSTING_MAP_CONFIG : undefined;
  }

  /**
   * API キーの取得 (Configuration Provider)
   */
  static getApiKey(): string {
    const config = this.getConfig();
    if (config && config.GOOGLE_MAPS_API_KEY) {
      return config.GOOGLE_MAPS_API_KEY as string;
    }
    return '';
  }

  /**
   * デフォルトのズームレベルを取得
   */
  static getDefaultZoom(): number {
    const config = this.getConfig();
    if (config && typeof config.DEFAULT_ZOOM === 'number') {
      return config.DEFAULT_ZOOM;
    }
    return 13; // デフォルト値
  }

  /**
   * デフォルトの中心座標を取得
   */
  static getDefaultCenter(): { lat: number; lng: number } {
    const config = this.getConfig();
    if (config && config.DEFAULT_CENTER) {
      return config.DEFAULT_CENTER;
    }
    // 初期値 (三重県津市周辺)
    return { lat: 34.7303, lng: 136.5086 };
  }

  /**
   * ジェスチャー制御ポリシーを取得
   */
  static getGestureHandling(): string {
    return 'cooperative';
  }

  /**
   * 漆黒UI用のダークテーマ地図スタイルJSON
   */
  static getDarkMapStyle(): any[] {
    return [
      { elementType: 'geometry', stylers: [{ color: '#111113' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#111113' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#606063' }] },
      {
        featureType: 'administrative.locality',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#a0a0a5' }]
      },
      {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#444446' }]
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{ color: '#0d0f0d' }]
      },
      {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#324032' }]
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#1c1c1e' }]
      },
      {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#0c0c0e' }]
      },
      {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#545456' }]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{ color: '#2c2c2e' }]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#1c1c1e' }]
      },
      {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#7c7c80' }]
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#07080a' }]
      },
      {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#2c2d30' }]
      }
    ];
  }
}
