/**
 * POSTING MAP H-app UI Rendering Engine
 * Restored & adapted from active_backup/mobile/render.js
 */
(function(window) {
  function getCleanAddress(addr) {
    if (!addr) return '';
    return addr.replace(/^〒\d{3}-\d{4}\s*/, '');
  }

  function formatCompletedAt(dateStr) {
    if (!dateStr) return '';
    if (/^\d{2}\/\d{2} \d{2}:\d{2}$/.test(dateStr)) return dateStr;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const MM = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const HH = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${MM}/${dd} ${HH}:${mm}`;
  }

  // 1. 詳細ポイントカード一覧の描画 (Area Points List)
  function renderDetailList(areaName, points = []) {
    const container = document.getElementById('detail-list');
    if (!container) return;

    const list = (points && points.length > 0) ? points : (window.allPoints || []);

    if (!list || list.length === 0) {
      container.innerHTML = `
        <div class="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100">
          <p class="text-gray-400 font-bold text-sm">該当エリアの住居データがありません</p>
        </div>`;
      return;
    }

    const cardsHtml = list.map((p) => {
      const currentStatus = p.status || (p.isDone ? 'SYNCED' : 'NOT_STARTED');
      let statusDot = 'bg-gray-300';
      let statusText = '未着手';
      let statusBadge = 'bg-gray-100 text-gray-500';

      if (currentStatus === 'IN_PROGRESS') {
        statusDot = 'bg-amber-500 animate-pulse';
        statusText = '配布中';
        statusBadge = 'bg-amber-50 text-amber-600 border border-amber-200';
      } else if (currentStatus === 'READY_TO_SYNC' || currentStatus === 'SYNCED') {
        statusDot = 'bg-green-500';
        statusText = '完了';
        statusBadge = 'bg-green-50 text-green-700 border border-green-200';
      }

      const cleanAddr = getCleanAddress(p.address || p.name || `地点 #${p.rowId}`);
      const isCompleted = (currentStatus === 'READY_TO_SYNC' || currentStatus === 'SYNCED');

      return `
        <div onclick="window.HAppWorkflow.openPointDetailModal(${p.rowId})" class="point-card-item bg-white rounded-2xl p-5 shadow-sm border border-gray-100 active:scale-[0.98] transition-all cursor-pointer flex justify-between items-center">
          <div class="space-y-1">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black ${statusBadge}">
              <span class="w-2 h-2 rounded-full ${statusDot}"></span>
              <span>${statusText} ${p.count ? `· ${p.count}枚` : ''}</span>
            </div>
            <h4 class="text-base font-black text-navy tracking-tight leading-snug">🏠 ${cleanAddr}</h4>
            ${p.memo ? `<p class="text-xs text-gray-400 font-medium">${p.memo}</p>` : ''}
          </div>
          <div class="text-right">
            <span class="text-xl font-bold text-gray-300">›</span>
          </div>
        </div>`;
    }).join('');

    container.innerHTML = `<div class="space-y-3">${cardsHtml}</div>`;
  }

  // 2. 単一住居ポイント詳細モーダルの描画
  function renderDetailModalContent(p) {
    if (!p) return '';
    const cleanAddr = getCleanAddress(p.address || p.name || `地点 #${p.rowId}`);
    const currentStatus = p.status || (p.isDone ? 'SYNCED' : 'NOT_STARTED');

    const addressHeaderHtml = `
      <div class="w-full flex flex-col items-center gap-2 text-center pb-2 border-b border-gray-100">
        <span class="inline-flex items-center px-4 py-1.5 bg-navy/5 text-navy font-black rounded-full text-sm">
          🏠 ${cleanAddr}
        </span>
        ${p.memo ? `<p class="text-xs text-gray-500 bg-gray-50 rounded-xl p-3 w-full text-center mt-1">${p.memo}</p>` : ''}
      </div>
    `;

    // 1. 未着手 (NOT_STARTED)
    if (currentStatus === 'NOT_STARTED') {
      return `
        ${addressHeaderHtml}
        <div class="space-y-4 pt-4">
          <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanAddr)}" target="_blank" class="w-full py-3.5 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center gap-2 text-xs font-black border border-blue-100">
            📍 Googleマップナビを開く
          </a>
          <button onclick="window.HAppWorkflow.startDistribution('${p.areaName || ''}', ${p.rowId})" class="w-full py-5 bg-navy hover:bg-navy-light text-white text-base font-black rounded-2xl shadow-xl shadow-navy/20 active:scale-98 transition-all">
            🟢 配布を開始する
          </button>
        </div>
      `;
    }

    // 2. 配布中 (IN_PROGRESS)
    if (currentStatus === 'IN_PROGRESS') {
      const gpsText = p.gps ? `📍 GPS取得済み (${p.gps})` : `📍 GPS未測定`;
      const photoText = p.tempPhotoUrl ? `📸 写真添付済み` : `📸 写真未添付`;

      return `
        ${addressHeaderHtml}
        <div class="space-y-4 pt-3">
          <div class="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 text-center space-y-2">
            <span class="text-xs font-bold text-gray-400 uppercase tracking-widest block">現在の配布設定</span>
            <div class="text-3xl font-black text-navy font-mono">${p.count || 0} <span class="text-sm">枚</span></div>
            <button onclick="window.HAppWorkflow.openNumpad('${p.areaName || ''}', '${p.rowId}', ${p.count || 0})" class="px-4 py-2 bg-white text-xs font-black text-navy border border-gray-200 rounded-xl shadow-sm">枚数を変更する</button>
          </div>

          <div class="grid grid-cols-2 gap-3 text-center">
            <button onclick="window.HAppWorkflow.acquireGPSForDetail('${p.areaName || ''}', ${p.rowId})" class="p-3 bg-apple rounded-2xl border border-gray-100 text-xs font-bold text-navy flex flex-col items-center gap-1">
              <span class="text-lg">📍</span>
              <span>${gpsText}</span>
            </button>
            <button onclick="window.HAppWorkflow.capturePhotoForDetail('${p.areaName || ''}', ${p.rowId})" class="p-3 bg-apple rounded-2xl border border-gray-100 text-xs font-bold text-navy flex flex-col items-center gap-1">
              <span class="text-lg">📸</span>
              <span>${photoText}</span>
            </button>
          </div>

          <button onclick="window.HAppWorkflow.commitDistribution('${p.areaName || ''}', ${p.rowId})" class="w-full py-5 bg-green-500 hover:bg-green-600 text-white text-base font-black rounded-2xl shadow-xl shadow-green-500/20 active:scale-98 transition-all">
            ✅ 配布を完了する
          </button>
        </div>
      `;
    }

    // 3. 完了 (SYNCED / READY_TO_SYNC)
    return `
      ${addressHeaderHtml}
      <div class="space-y-4 pt-4 text-center">
        <div class="bg-green-50 border border-green-200 rounded-2xl p-6 space-y-2">
          <span class="text-xs font-black text-green-700 uppercase tracking-widest block">🔒 MISSION COMPLETED</span>
          <div class="text-3xl font-black text-navy font-mono">${p.count || 0} 枚</div>
          <p class="text-xs text-gray-400 font-medium">${p.completedAt ? formatCompletedAt(p.completedAt) : ''}</p>
        </div>
        <button onclick="window.HAppWorkflow.closeDetailModal()" class="w-full py-4 bg-apple text-navy font-black rounded-2xl text-xs uppercase">閉じる</button>
      </div>
    `;
  }

  // 3. 提出確認モーダル (Confirm Modal)
  function renderConfirmModal(areaName, p) {
    const modal = document.getElementById('confirm-modal');
    const content = document.getElementById('confirm-modal-content');
    if (!modal || !content) return;

    const cleanAddr = getCleanAddress(p.address || p.name || `地点 #${p.rowId}`);
    const count = p.count || 0;
    const hasPhoto = !!p.tempPhotoUrl || !!p.photoBase64;
    const hasGps = !!p.gps;

    content.innerHTML = `
      <h3 class="text-lg font-black text-navy mb-4 text-center tracking-tight">配布実績の提出確認</h3>
      <div class="space-y-3 bg-apple rounded-2xl p-4 text-left">
        <div class="flex justify-between items-center text-xs">
          <span class="font-bold text-gray-400">お届け先</span>
          <span class="font-black text-navy">${cleanAddr}</span>
        </div>
        <div class="flex justify-between items-center text-xs">
          <span class="font-bold text-gray-400">配布枚数</span>
          <span class="font-black text-navy text-base font-mono">${count} 枚</span>
        </div>
        <div class="flex justify-between items-center text-xs">
          <span class="font-bold text-gray-400">証跡写真</span>
          <span class="font-bold ${hasPhoto ? 'text-green-600' : 'text-gray-400'}">${hasPhoto ? '✓ 添付あり' : 'なし'}</span>
        </div>
        <div class="flex justify-between items-center text-xs">
          <span class="font-bold text-gray-400">GPS位置情報</span>
          <span class="font-bold ${hasGps ? 'text-green-600' : 'text-gray-400'}">${hasGps ? '✓ 測位済み' : '未取得'}</span>
        </div>
      </div>

      <div class="flex gap-3 mt-6">
        <button onclick="window.HAppWorkflow.closeConfirmModal()" class="flex-1 py-4 rounded-2xl bg-gray-100 text-xs font-black text-gray-500">戻る</button>
        <button onclick="window.HAppWorkflow.executeCommitDistribution('${areaName}', ${p.rowId})" class="flex-1 py-4 rounded-2xl bg-navy text-xs font-black text-white shadow-xl shadow-navy/20">送信確定</button>
      </div>
    `;

    modal.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
  }

  window.HAppRender = {
    renderDetailList,
    renderDetailModalContent,
    renderConfirmModal,
    getCleanAddress
  };

  // Bind global helpers
  window.renderDetailList = renderDetailList;
  window.renderDetailModalContent = renderDetailModalContent;
  window.renderConfirmModal = renderConfirmModal;
})(window);
