/**
 * POSTING MAP H-app Core Coordinator
 * Integrates GPS, Camera, Sync, and Workflow into the H-app UI Shell
 */
(function(window) {
  function initHAppCore() {
    console.log("[H-app Core] Initializing H-app Production Modules...");
    
    // 1. GPS の初期化
    if (window.HAppGPS) {
      window.HAppGPS.startGPSWatching();
    }

    // 2. オフラインキューの自動同期開始
    if (window.HAppSync) {
      window.HAppSync.syncOfflineQueue();
    }
  }

  // エリア作業開始 (HOME -> WORK -> DONE 導線)
  async function startAreaMission(area) {
    console.log("[H-app Core] Starting Mission for area:", area);

    // 1. GPS 位置情報を測定
    let gps = { latitude: '', longitude: '', accuracy: null };
    if (window.HAppGPS) {
      if (typeof window.showToast === 'function') window.showToast('GPS位置情報を取得中...');
      gps = await window.HAppGPS.getGPSLocation();
    }

    // 2. カメラを起動して写真撮影・圧縮
    let photo = null;
    if (window.HAppCamera) {
      if (typeof window.showToast === 'function') window.showToast('配布証跡写真を撮影してください');
      photo = await window.HAppCamera.capturePhoto();
    }

    // 3. テンキーモーダルを開いて配布枚数を入力
    if (window.HAppWorkflow) {
      window.HAppWorkflow.openNumpad(area.id || 'AREA_001', area.name || '担当エリア', 0, async (count) => {
        if (typeof window.showLoading === 'function') window.showLoading('送信中...');
        
        // 4. GAS への実績送信 / オフライン保存
        const result = await window.HAppWorkflow.submitFieldReport({
          areaId: area.id || area.name,
          areaName: area.name,
          count: count,
          photoBase64: photo ? photo.base64 : '',
          gpsLocation: gps
        });

        if (typeof window.hideLoading === 'function') window.hideLoading();
        
        // UI側の進捗をオプティミスティック更新
        if (window.appData && Array.isArray(window.appData.areas)) {
          const targetArea = window.appData.areas.find(a => a.name === area.name || a.id === area.id);
          if (targetArea) {
            targetArea.progress = Math.min(100, (targetArea.progress || 0) + 10);
            if (typeof window.renderView === 'function') window.renderView();
          }
        }
      });
    }
  }

  window.HAppCore = {
    initHAppCore,
    startAreaMission
  };

  document.addEventListener('DOMContentLoaded', () => {
    initHAppCore();
  });
})(window);
