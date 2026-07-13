/**
 * GoogleMapsScriptLoader.ts
 * 
 * Google Maps JavaScript API のスクリプトを動的にロードし、
 * 多重ロード防止および Promise によるロード通知を行うヘルパークラス。
 */
export class GoogleMapsScriptLoader {
  private static loadPromise: Promise<void> | null = null;

  /**
   * Google Maps API のスクリプトを読み込む
   */
  static load(apiKey: string): Promise<void> {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    if ((window as any).google && (window as any).google.maps) {
      this.loadPromise = Promise.resolve();
      return this.loadPromise;
    }

    this.loadPromise = new Promise<void>((resolve, reject) => {
      const callbackName = '__googleMapsCallback';
      
      // グローバルコールバックの定義
      (window as any)[callbackName] = () => {
        try {
          delete (window as any)[callbackName];
        } catch (e) {
          (window as any)[callbackName] = undefined;
        }
        resolve();
      };

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&callback=${callbackName}`;
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        this.loadPromise = null;
        reject(new Error('Google Maps script load failed.'));
      };

      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  /**
   * テスト用にローダー状態をリセットする
   */
  static resetForTest(): void {
    this.loadPromise = null;
  }
}
