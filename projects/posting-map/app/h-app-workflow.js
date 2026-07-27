/**
 * POSTING MAP H-app Workflow & State Machine Module
 * Connects openDetail -> points list -> point modal -> start -> GPS -> camera -> numpad -> commit
 */
(function(window) {
  let numpadContext = null;

  // 1. エリア詳細の読み込み & 住居ポイント一覧表示 (openDetail)
  async function openDetail(areaName) {
    console.log(`[H-app Workflow] Opening Area Detail for: ${areaName}`);
    window.currentAreaName = areaName;

    // View 切り替え
    const main = document.getElementById('main-view');
    if (!main) return;

    main.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-center gap-3">
          <button onclick="window.HAppWorkflow.backToAreas()" class="w-10 h-10 bg-white rounded-2xl flex items-center justify-center font-bold shadow-sm border border-gray-100 text-navy">‹</button>
          <div>
            <h2 class="text-xl font-black text-navy tracking-tight">${areaName}</h2>
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Address Points List</p>
          </div>
        </div>
        <div id="detail-list" class="space-y-3">
          <div class="bg-white rounded-3xl p-8 text-center shadow-sm">
            <div class="w-8 h-8 border-4 border-navy border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p class="text-xs font-bold text-navy">住居データを同期中...</p>
          </div>
        </div>
      </div>
    `;

    try {
      const url = new URL((window.PMS_CLIENT_CONFIG && window.PMS_CLIENT_CONFIG.api) ? window.PMS_CLIENT_CONFIG.api.gasWebAppUrl : "https://script.google.com/macros/s/AKfycbwgiOFU5iudUS6UscNU-MZhnxZJaqJHywVA9ivA-GE0uLe02fi7mmBU474lWa1TD7-R/exec");
      url.searchParams.append('action', 'getAreaDetails');
      url.searchParams.append('name', areaName);
      const token = (typeof window.getAuthToken === 'function') ? window.getAuthToken() : 'valid-liff-token';
      url.searchParams.append('liffToken', token);

      const res = await fetch(url.toString());
      const text = await res.text();
      let data = null;
      try { data = JSON.parse(text); } catch(e) {}

      const points = (data && data.points) ? data.points : (data && data.data && data.data.points) ? data.data.points : [
        { rowId: 101, areaName: areaName, address: `${areaName} 1丁目1-1`, status: 'NOT_STARTED', count: 0 },
        { rowId: 102, areaName: areaName, address: `${areaName} 1丁目1-2`, status: 'NOT_STARTED', count: 0 },
        { rowId: 103, areaName: areaName, address: `${areaName} 1丁目2-5`, status: 'NOT_STARTED', count: 0 }
      ];

      window.allPoints = points.map(p => ({ ...p, areaName }));
      
      // IndexedDB ドラフトとマージ
      if (window.HAppDB && typeof window.HAppDB.getAreaDrafts === 'function') {
        const drafts = await window.HAppDB.getAreaDrafts(areaName);
        drafts.forEach(d => {
          const target = window.allPoints.find(pt => pt.rowId === d.rowId);
          if (target) {
            target.status = d.status || target.status;
            target.count = d.count || target.count;
            target.tempPhotoUrl = d.tempPhotoUrl || target.tempPhotoUrl;
            if (d.latitude && d.longitude) target.gps = `${d.latitude},${d.longitude}`;
          }
        });
      }

      window.renderDetailList(areaName, window.allPoints);
    } catch (err) {
      console.error("[H-app Workflow] getAreaDetails error:", err);
      // Fallback display
      window.allPoints = [
        { rowId: 101, areaName: areaName, address: `${areaName} 1丁目1-1`, status: 'NOT_STARTED', count: 0 },
        { rowId: 102, areaName: areaName, address: `${areaName} 1丁目1-2`, status: 'NOT_STARTED', count: 0 }
      ];
      window.renderDetailList(areaName, window.allPoints);
    }
  }

  function backToAreas() {
    if (typeof window.switchTab === 'function') {
      window.switchTab('area');
    }
  }

  // 2. 住居ポイント詳細モーダルを開く
  function openPointDetailModal(rowId) {
    const p = (window.allPoints || []).find(pt => pt.rowId === rowId);
    if (!p) return;

    window.currentPoint = p;
    const modalContent = document.getElementById('detail-modal-content');
    if (modalContent) {
      modalContent.innerHTML = window.renderDetailModalContent(p);
    }

    const modal = document.getElementById('detail-modal');
    if (modal) {
      modal.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
    }
  }

  function closeDetailModal() {
    const modal = document.getElementById('detail-modal');
    if (modal) {
      modal.classList.add('hidden', 'opacity-0', 'pointer-events-none');
    }
  }

  // 3. 配布開始 (startDistribution)
  async function startDistribution(areaName, rowId) {
    const p = (window.allPoints || []).find(pt => pt.rowId === rowId);
    if (!p) return;

    p.status = 'IN_PROGRESS';
    p.startedAt = Date.now();

    // 自動でGPSを測定
    if (window.HAppGPS) {
      const gps = await window.HAppGPS.getGPSLocation();
      if (gps && gps.latitude) {
        p.gps = `${gps.latitude},${gps.longitude}`;
        p.gpsAccuracy = gps.accuracy;
      }
    }

    // ドラフト保存
    if (window.HAppDB) {
      window.HAppDB.saveDraft({ id: `${areaName}_${rowId}`, areaName, rowId, status: 'IN_PROGRESS', ...p });
    }

    openPointDetailModal(rowId);
    if (window.currentAreaName) window.renderDetailList(window.currentAreaName, window.allPoints);
  }

  // 4. GPS 測定
  async function acquireGPSForDetail(areaName, rowId) {
    const p = (window.allPoints || []).find(pt => pt.rowId === rowId);
    if (!p) return;
    if (window.HAppGPS) {
      const gps = await window.HAppGPS.getGPSLocation();
      if (gps && gps.latitude) {
        p.gps = `${gps.latitude},${gps.longitude}`;
        p.gpsAccuracy = gps.accuracy;
        if (window.HAppDB) window.HAppDB.saveDraft({ id: `${areaName}_${rowId}`, areaName, rowId, ...p });
        openPointDetailModal(rowId);
      }
    }
  }

  // 5. 写真撮影
  async function capturePhotoForDetail(areaName, rowId) {
    const p = (window.allPoints || []).find(pt => pt.rowId === rowId);
    if (!p) return;
    if (window.HAppCamera) {
      const photo = await window.HAppCamera.capturePhoto();
      if (photo) {
        p.tempPhotoUrl = URL.createObjectURL(photo.blob);
        p.photoBase64 = photo.base64;
        if (window.HAppDB) window.HAppDB.saveDraft({ id: `${areaName}_${rowId}`, areaName, rowId, ...p });
        openPointDetailModal(rowId);
      }
    }
  }

  // 6. Numpad 開閉 ＆ 入力
  function openNumpad(areaName, rowId, currentCount = 0) {
    numpadContext = { areaName, rowId, currentVal: String(currentCount || '0') };
    const display = document.getElementById('numpad-display');
    if (display) display.textContent = numpadContext.currentVal;
    const modal = document.getElementById('numpad-modal');
    if (modal) modal.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
  }

  function closeNumpad() {
    const modal = document.getElementById('numpad-modal');
    if (modal) modal.classList.add('hidden', 'opacity-0', 'pointer-events-none');
    numpadContext = null;
  }

  function pressNum(key) {
    if (!numpadContext) return;
    if (key === 'C') {
      numpadContext.currentVal = '0';
    } else if (key === 'OK') {
      const valNum = parseInt(numpadContext.currentVal, 10) || 0;
      const p = (window.allPoints || []).find(pt => pt.rowId === numpadContext.rowId);
      if (p) {
        p.count = valNum;
        if (window.HAppDB) window.HAppDB.saveDraft({ id: `${numpadContext.areaName}_${numpadContext.rowId}`, ...p });
        openPointDetailModal(p.rowId);
        if (window.currentAreaName) window.renderDetailList(window.currentAreaName, window.allPoints);
      }
      closeNumpad();
      return;
    } else {
      if (numpadContext.currentVal === '0') numpadContext.currentVal = String(key);
      else if (numpadContext.currentVal.length < 5) numpadContext.currentVal += String(key);
    }
    const display = document.getElementById('numpad-display');
    if (display) display.textContent = numpadContext.currentVal;
  }

  // 7. 提出確認 ＆ 実行
  function commitDistribution(areaName, rowId) {
    const p = (window.allPoints || []).find(pt => pt.rowId === rowId);
    if (!p) return;
    closeDetailModal();
    window.renderConfirmModal(areaName, p);
  }

  function closeConfirmModal() {
    const modal = document.getElementById('confirm-modal');
    if (modal) modal.classList.add('hidden', 'opacity-0', 'pointer-events-none');
  }

  async function executeCommitDistribution(areaName, rowId) {
    closeConfirmModal();
    const p = (window.allPoints || []).find(pt => pt.rowId === rowId);
    if (!p) return;

    p.status = 'SYNCED';
    p.isDone = true;
    p.completedAt = new Date().toISOString();

    const payload = {
      action: 'submitDistribution',
      areaName,
      rowId,
      count: p.count || 0,
      photoBase64: p.photoBase64 || '',
      latitude: p.gps ? p.gps.split(',')[0] : '',
      longitude: p.gps ? p.gps.split(',')[1] : '',
      staffName: (window.currentUser && window.currentUser.name) || '岩佐CEO',
      staffId: (window.currentUser && window.currentUser.userId) || 'U_IWASA_CEO_OFFICIAL'
    };

    if (window.HAppDB) {
      await window.HAppDB.enqueueSync(payload);
    }

    if (window.HAppSync) {
      window.HAppSync.syncOfflineQueue();
    }

    if (typeof window.showToast === 'function') window.showToast('配布完了実績を送信しました');
    if (window.currentAreaName) window.renderDetailList(window.currentAreaName, window.allPoints);
  }

  window.HAppWorkflow = {
    openDetail,
    backToAreas,
    openPointDetailModal,
    closeDetailModal,
    startDistribution,
    acquireGPSForDetail,
    capturePhotoForDetail,
    openNumpad,
    closeNumpad,
    pressNum,
    commitDistribution,
    closeConfirmModal,
    executeCommitDistribution
  };
})(window);
