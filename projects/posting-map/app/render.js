/**
 * POSTING MAP H-app UI Rendering Engine
 * Adapter & Restored Engine for FIELD OPERATIONS OS Dark Glass UI
 */
(function(window) {
  function $(id) { return document.getElementById(id); }

  function getCleanAddress(addr) {
    if (!addr) return '';
    return String(addr).replace(/^〒\d{3}-\d{4}\s*/, '');
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

  // TASK-012: 内部マスター情報と現場表示情報を分離する DTO 変換関数
  function normalizeAreasForDisplay(rawAreas) {
    if (!Array.isArray(rawAreas)) return [];
    
    // 1. 内部マスター識別子 (MIE03_ADDRESS_MASTER 等) を完全フィルタアウト
    const filtered = rawAreas.filter(a => {
      if (!a) return false;
      const name = String(a.name || a.id || '').trim();
      if (name.includes('MASTER') || name.includes('ADDRESS_MASTER') || name.startsWith('MIE03_')) {
        return false;
      }
      return true;
    });

    // 2. 現場配布員向けエリア名の正規化 (カッコ数字 -> 第Nエリア)
    return filtered.map(a => {
      let displayName = a.name || a.id || '現場エリア';
      displayName = displayName.replace(/\((\d+)\)/, ' 第$1エリア');

      return {
        id: a.id || a.name,
        name: displayName,
        rawName: a.name || a.id,
        progress: Number(a.progress || 0),
        count: Number(a.count || a.done || 0),
        total: Number(a.total || 500),
        repAddress: a.repAddress || ''
      };
    });
  }

  // 1. エリア一覧のレンダリング (HOME Dashboard - Dark Glass UI)
  function renderAreas() {
    const container = $('area-list') || $('new-area-list');
    if (!container) return;

    const rawAreas = (window.appData && Array.isArray(window.appData.areas)) ? window.appData.areas : [];
    
    // TASK-012: DTO 変換（内部マスター排除 ＆ 現場表示名正規化）
    const areas = normalizeAreasForDisplay(rawAreas);

    if (!areas || areas.length === 0) {
      container.innerHTML = `
        <div class="premium-glass p-8 text-center space-y-2">
          <div class="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-2">
            <span class="text-sm">🗺️</span>
          </div>
          <p class="text-white/70 font-bold text-sm">配属エリアデータを準備中...</p>
          <p class="text-[10px] text-white/40 font-mono uppercase tracking-widest">FIELD OPERATIONS OS</p>
        </div>`;
      return;
    }

    const cardsHtml = areas.map((area) => {
      const progress = area.progress;
      const count = area.count;
      const total = area.total;

      let borderStyle = 'border: 1px solid rgba(255, 255, 255, 0.06);';
      let badgeBg = 'bg-white/5 text-white/50 border-white/10';
      let badgeText = '未着手';
      let progressColor = '#2563eb';

      if (progress >= 100) {
        borderStyle = 'border: 1px solid rgba(34, 197, 94, 0.35); box-shadow: inset 0 0 15px rgba(34, 197, 94, 0.08);';
        badgeBg = 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20';
        badgeText = '完了';
        progressColor = '#22c55e';
      } else if (progress > 0) {
        borderStyle = 'border: 1px solid rgba(37, 99, 235, 0.35); box-shadow: inset 0 0 15px rgba(37, 99, 235, 0.08);';
        badgeBg = 'bg-[#2563eb]/10 text-[#2563eb] border-[#2563eb]/20';
        badgeText = '進行中';
      }

      return `
        <div style="${borderStyle}" onclick="window.HAppWorkflow.openDetail('${area.rawName}')" class="premium-glass p-6 space-y-4 clickable-card cursor-pointer">
          <div class="flex justify-between items-start">
            <div class="space-y-1">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${badgeBg}">${badgeText}</span>
              <h3 class="text-xl font-black text-white tracking-tight leading-tight pt-1">${area.name}</h3>
              ${area.repAddress ? `<p class="text-xs text-white/40 font-medium font-mono">${area.repAddress.replace(/^〒\d{3}-\d{4}\s*/, '')}</p>` : ''}
            </div>
            <div class="text-right">
              <div class="text-2xl font-black font-mono" style="color: ${progressColor}">${progress}<span class="text-xs ml-0.5">%</span></div>
            </div>
          </div>
          
          <div class="space-y-2">
            <div class="flex justify-between items-center text-xs font-bold text-white/50 font-mono">
              <span>配布枚数</span>
              <span>${count.toLocaleString()} / ${total.toLocaleString()} 枚</span>
            </div>
            <div class="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-500" style="width: ${progress}%; background: ${progressColor}; box-shadow: 0 0 10px ${progressColor};"></div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = cardsHtml;
  }

  // 2. ポイント一覧の描画 (Area Detail)
  function renderDetailList(areaName, points = []) {
    const container = $('detail-list');
    if (!container) return;

    const list = (points && points.length > 0) ? points : (Array.isArray(window.allPoints) ? window.allPoints : []);

    if (!list || list.length === 0) {
      container.innerHTML = `
        <div class="premium-glass p-8 text-center space-y-2">
          <p class="text-white/70 font-bold text-sm">該当エリアの住居データを読み込み中...</p>
          <p class="text-[10px] text-white/40 font-mono uppercase tracking-widest">FETCHING MIE03_ADDRESS_MASTER</p>
        </div>`;
      return;
    }

    const cardsHtml = list.map((p) => {
      const currentStatus = p.status || (p.isDone ? 'SYNCED' : 'NOT_STARTED');
      let badgeBg = 'bg-white/5 text-white/40 border-white/10';
      let statusText = '未着手';
      let dotColor = 'bg-gray-400';

      if (currentStatus === 'IN_PROGRESS') {
        badgeBg = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        statusText = '配布中';
        dotColor = 'bg-amber-400 animate-pulse';
      } else if (currentStatus === 'READY_TO_SYNC' || currentStatus === 'SYNCED') {
        badgeBg = 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20';
        statusText = '完了';
        dotColor = 'bg-[#22c55e]';
      }

      const cleanAddr = getCleanAddress(p.address || p.name || `地点 #${p.rowId}`);

      return `
        <div onclick="window.HAppWorkflow.openPointDetailModal(${p.rowId})" class="premium-glass p-5 flex justify-between items-center clickable-card cursor-pointer">
          <div class="space-y-1.5">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black border ${badgeBg}">
              <span class="w-1.5 h-1.5 rounded-full ${dotColor}"></span>
              <span>${statusText} ${p.count ? `· ${p.count}枚` : ''}</span>
            </div>
            <h4 class="text-base font-black text-white tracking-tight leading-snug">🏠 ${cleanAddr}</h4>
            ${p.memo ? `<p class="text-xs text-white/40 font-medium">${p.memo}</p>` : ''}
          </div>
          <div class="text-right">
            <span class="text-xl font-bold text-white/30">›</span>
          </div>
        </div>`;
    }).join('');

    container.innerHTML = cardsHtml;
  }

  // 3. Gyro ID Card & Settings のレンダリング
  function renderSettings() {
    const container = $('settings-content');
    if (!container) return;

    let userInfo = null;
    try {
      userInfo = JSON.parse(localStorage.getItem('user_info'));
    } catch(e) {}
    if (!userInfo && window.currentUser && window.currentUser.id && window.currentUser.id !== 'U_IWASA_CEO_OFFICIAL') {
      userInfo = {
        last: window.currentUser.last || window.currentUser.displayName || '',
        first: window.currentUser.first || '',
        id: window.currentUser.id,
        picture: window.currentUser.pictureUrl || ''
      };
    }

    if (!userInfo || !userInfo.last) {
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center pt-4 pb-12">
          <div class="mb-6 text-center space-y-1">
            <h3 class="text-lg font-black text-white">公式配布員プロファイル</h3>
            <p class="text-xs text-white/50 font-medium">LINEアカウント情報を取得中、または名前を登録してください</p>
          </div>
          <div class="w-full premium-glass p-8 space-y-6 text-left">
            <div class="space-y-4">
              <div>
                <label class="text-[11px] font-black uppercase tracking-[0.2em] mb-2 block text-white/70 text-center">苗字</label>
                <input type="text" id="user-last" class="w-full h-14 bg-[#1C1C1E] border border-white/10 rounded-2xl px-5 text-lg font-black text-white outline-none focus:border-[#2563eb] text-center" placeholder="例：山田">
              </div>
              <div>
                <label class="text-[11px] font-black uppercase tracking-[0.2em] mb-2 block text-white/70 text-center">名前</label>
                <input type="text" id="user-first" class="w-full h-14 bg-[#1C1C1E] border border-white/10 rounded-2xl px-5 text-lg font-black text-white outline-none focus:border-[#2563eb] text-center" placeholder="例：太郎">
              </div>
            </div>
            <button onclick="saveProfile()" class="btn-neu w-full bg-[#2563eb] text-white rounded-2xl py-5 text-lg font-black shadow-xl">登録を完了する</button>
          </div>
        </div>
      `;
    } else {
      const avatarHtml = userInfo.picture ? `
        <div class="w-24 h-24 rounded-full overflow-hidden border-2 border-white/20 shadow-2xl mb-4 relative z-10">
          <img src="${userInfo.picture}" class="w-full h-full object-cover">
        </div>
      ` : `
        <div class="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 relative z-10">
          <span class="text-3xl text-white/40">👤</span>
        </div>
      `;

      const formattedId = userInfo.id ? String(userInfo.id).replace(/^[A-Za-z_]+/, 'STAFF ID ') : 'STAFF ID UNKNOWN';
      const rawBranch = localStorage.getItem('branch_name') || '三重第3区';
      const displayBranch = rawBranch ? (rawBranch.includes('支部') ? rawBranch : `${rawBranch} 支部`) : '';

      container.innerHTML = `
        <div class="pt-2 pb-0 flex flex-col items-center">
          <div class="mb-6 flex items-center justify-center gap-3">
            <span class="text-xs font-bold text-white/50 tracking-wider">公式配布員</span>
            <span style="letter-spacing: 0.15em; background: linear-gradient(180deg, rgba(37,99,235,0.16), rgba(37,99,235,0.06)); border: 1px solid rgba(37,99,235,0.3); box-shadow: inset 0 1px 0 rgba(255,255,255,0.15), 0 0 12px rgba(37,99,235,0.25);" class="inline-flex items-center justify-center h-6 px-3 text-[10px] font-black text-[#2563eb] font-mono rounded-full">${formattedId}</span>
          </div>
          
          <div id="id-gyro-card" style="height: 300px; --glow-x: 0px; --glow-y: 0px; --glow-opacity: 0.08; --edge-opacity: 0.08; --edge-angle: 180deg;" class="w-full max-w-sm gyro-card flex flex-col items-center p-6 relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-b from-white/5 to-white/0 pointer-events-none rounded-[28px]"></div>
            
            <div style="margin-top: 18px;" class="inline-flex items-center gap-2 z-10">
              <span class="w-2 h-2 bg-[#22c55e] rounded-full shadow-[0_0_8px_#22c55e] animate-soft-pulse"></span>
              <span class="text-[8px] font-black text-[#22c55e] uppercase tracking-[0.3em]">Authorized Staff</span>
            </div>
            
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);" class="flex flex-col items-center z-10 w-full max-w-[280px]">
              ${avatarHtml}
              <div style="font-size: 26px; font-weight: 900; color: #ffffff; text-align: center; letter-spacing: 0.05em; line-height: 1.1;" class="flex flex-col items-center w-full">
                <div class="truncate w-full">${userInfo.last || ''}</div>
                <div class="text-xs text-white/40 font-medium mt-1 truncate w-full">${userInfo.first || ''}</div>
              </div>
            </div>
            
            <div style="position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%); width: 100%;" class="flex flex-col items-center gap-0.5 z-10">
              ${displayBranch ? `<p class="text-[8px] font-black text-white/40 uppercase tracking-[0.3em]">${displayBranch}</p>` : ''}
              <p class="text-[8px] font-black text-white/40 uppercase tracking-[0.3em]">Field Operations</p>
              <p style="margin-top: 10px;" class="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] select-none">
                <span class="cursor-pointer hover:text-white transition-colors" onclick="openIdInfoModal('terms', event)">Terms</span>
                &nbsp;&nbsp;
                <span class="cursor-pointer hover:text-white transition-colors" onclick="openIdInfoModal('privacy', event)">Privacy</span>
                &nbsp;&nbsp;
                <span class="cursor-pointer hover:text-white transition-colors" onclick="openIdInfoModal('license', event)">License</span>
              </p>
            </div>
          </div>
        </div>
      `;
    }
  }

  // 4. 全体ランキング & My Performance のレンダリング
  function renderRanking() {
    const container = $('ranking-list');
    if (!container) return;

    const headerCardHtml = `
      <div style="border: 1px solid rgba(37, 99, 235, 0.35); box-shadow: inset 0 0 15px rgba(37, 99, 235, 0.08), 0 0 25px rgba(37, 99, 235, 0.12);" class="premium-glass py-5 px-6 flex flex-col items-center justify-center text-center gap-2 mb-6">
        <div class="w-8 h-8 rounded-xl bg-[#2563eb]/10 border border-[#2563eb]/20 flex items-center justify-center shadow-lg shadow-[#2563eb]/10 mb-0.5">
          <span class="text-base">🏆</span>
        </div>
        <div class="text-lg font-black text-white tracking-tight">MIE-03 配布ランキング</div>
      </div>
    `;

    let userInfo = null;
    try { userInfo = JSON.parse(localStorage.getItem('user_info')); } catch(e) {}
    const myName = userInfo ? `${userInfo.last} ${userInfo.first || ''}`.trim() : (window.currentUser ? window.currentUser.displayName : '');

    const displayRanking = (Array.isArray(window.rankingData) && window.rankingData.length > 0) ? window.rankingData : (
      (window.appData && Array.isArray(window.appData.ranking)) ? window.appData.ranking : []
    );

    if (!displayRanking || displayRanking.length === 0) {
      container.innerHTML = headerCardHtml + `
        <div class="premium-glass p-8 text-center space-y-2">
          <p class="text-white/70 font-bold text-sm">ランキングデータを読み込み中...</p>
          <p class="text-[10px] text-white/40 font-mono uppercase tracking-widest">FETCHING MIE-03 DISTRIBUTOR RANKING</p>
        </div>
      `;
      return;
    }

    let myCount = 0;
    const idx = displayRanking.findIndex(r => r.name === myName);
    if (idx !== -1) myCount = displayRanking[idx].count || 0;

    const myStatusCardHtml = myName ? `
      <div style="border: 1px solid rgba(255, 255, 255, 0.08);" class="premium-glass py-5 px-6 flex flex-col items-center justify-center text-center gap-2 mb-6">
        <div class="text-[9px] font-black text-[#22c55e] uppercase tracking-[0.2em]">My Performance</div>
        <div class="text-lg font-black text-white tracking-tight">${myName}</div>
        <div class="flex items-center justify-center mt-0.5">
          <div style="background: rgba(34, 197, 94, 0.08); border: 1px solid rgba(34, 197, 94, 0.25); height: 24px; font-size: 11px; color: #22c55e;" class="inline-flex items-center justify-center px-3 font-black rounded-full font-mono">
            現在までの配布数 : ${Number(myCount).toLocaleString()} 枚
          </div>
        </div>
      </div>
    ` : '';

    const itemsHtml = displayRanking.map((r, index) => {
      const rank = index + 1;
      const isMe = myName && r.name === myName;

      let cardStyle = 'border: 1px solid rgba(255, 255, 255, 0.06);';
      let rankBadgeClass = 'bg-white/5 text-white/40 border border-white/10';

      if (rank === 1) {
        cardStyle = 'border: 1px solid rgba(250, 204, 21, 0.35); box-shadow: inset 0 0 15px rgba(250, 204, 21, 0.08);';
        rankBadgeClass = 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
      } else if (rank === 2) {
        cardStyle = 'border: 1px solid rgba(226, 232, 240, 0.3);';
        rankBadgeClass = 'bg-slate-300/10 text-slate-300 border border-slate-300/20';
      } else if (rank === 3) {
        cardStyle = 'border: 1px solid rgba(217, 119, 6, 0.3);';
        rankBadgeClass = 'bg-amber-600/10 text-amber-500 border border-amber-600/20';
      }

      return `
        <div style="${cardStyle}" class="premium-glass p-5 flex justify-between items-center ${isMe ? 'bg-white/5' : ''}">
          <div class="flex items-center gap-4">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black font-mono ${rankBadgeClass}">${rank}</div>
            <div class="text-base font-black text-white tracking-tight">${r.name || 'スタッフ'}</div>
          </div>
          <div class="text-lg font-black text-[#2563eb] font-mono">${Number(r.count || 0).toLocaleString()} <span class="text-xs text-white/40">枚</span></div>
        </div>
      `;
    }).join('');

    container.innerHTML = headerCardHtml + myStatusCardHtml + `<div class="space-y-4">${itemsHtml}</div>`;
  }

  // 5. 保管状況一覧のレンダリング (Stock List)
  function renderStorageList(stocks = []) {
    const container = $('new-storage-list-container') || $('storage-list-container');
    if (!container) return;

    const list = (Array.isArray(stocks) && stocks.length > 0) ? stocks : (
      (window.appData && Array.isArray(window.appData.flyerStocks)) ? window.appData.flyerStocks : []
    );

    if (!list || list.length === 0) {
      container.innerHTML = `
        <div class="premium-glass p-8 text-center space-y-2">
          <p class="text-white/70 font-bold text-sm">チラシ保管庫データを読み込み中...</p>
          <p class="text-[10px] text-white/40 font-mono uppercase tracking-widest">FETCHING MIE-03 FLYER STOCK INVENTORY</p>
        </div>`;
      return;
    }

    const cardsHtml = list.map(s => `
      <div class="premium-glass p-6 flex justify-between items-center">
        <div class="space-y-1">
          <div class="text-xs font-bold text-white/40 uppercase tracking-wider">保管場所</div>
          <div class="text-lg font-black text-white">${s.location || s.city || '支部保管庫'}</div>
        </div>
        <div class="text-right space-y-1">
          <div class="text-2xl font-black text-[#22c55e] font-mono">${Number(s.count || 0).toLocaleString()} <span class="text-xs text-white/40">枚</span></div>
          <div class="text-[10px] text-white/30 font-mono">${s.updatedAt || s.date || ''}</div>
        </div>
      </div>
    `).join('');

    container.innerHTML = cardsHtml;
  }

  // 6. 単一住居ポイント詳細モーダルの描画
  function renderDetailModalContent(p) {
    if (!p) return '';
    const cleanAddr = getCleanAddress(p.address || p.name || `地点 #${p.rowId}`);
    const currentStatus = p.status || (p.isDone ? 'SYNCED' : 'NOT_STARTED');

    const addressHeaderHtml = `
      <div class="w-full flex flex-col items-center gap-2 text-center pb-2 border-b border-white/10">
        <span class="inline-flex items-center px-4 py-1.5 bg-white/5 border border-white/10 text-white font-black rounded-full text-sm">
          🏠 ${cleanAddr}
        </span>
        ${p.memo ? `<p class="text-xs text-white/50 bg-white/5 rounded-xl p-3 w-full text-center mt-1">${p.memo}</p>` : ''}
      </div>
    `;

    if (currentStatus === 'NOT_STARTED') {
      return `
        ${addressHeaderHtml}
        <div class="space-y-4 pt-4">
          <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanAddr)}" target="_blank" class="w-full py-3.5 bg-blue-500/10 text-[#2563eb] rounded-2xl flex items-center justify-center gap-2 text-xs font-black border border-blue-500/20">
            📍 Googleマップナビを開く
          </a>
          <button onclick="window.HAppWorkflow.startDistribution('${p.areaName || ''}', ${p.rowId})" class="btn-neu w-full py-5 bg-[#2563eb] text-white text-base font-black rounded-2xl shadow-xl">
            🟢 配布を開始する
          </button>
        </div>
      `;
    }

    if (currentStatus === 'IN_PROGRESS') {
      const gpsText = p.gps ? `📍 GPS取得済み` : `📍 GPS未測定`;
      const photoText = p.tempPhotoUrl ? `📸 写真添付済み` : `📸 写真未添付`;

      return `
        ${addressHeaderHtml}
        <div class="space-y-4 pt-3">
          <div class="bg-white/5 border border-white/10 rounded-2xl p-4 text-center space-y-2">
            <span class="text-xs font-bold text-white/40 uppercase tracking-widest block">現在の配布設定</span>
            <div class="text-3xl font-black text-white font-mono">${p.count || 0} <span class="text-sm">枚</span></div>
            <button onclick="window.HAppWorkflow.openNumpad('${p.areaName || ''}', '${p.rowId}', ${p.count || 0})" class="px-4 py-2 bg-white/10 text-xs font-black text-white border border-white/20 rounded-xl">枚数を変更する</button>
          </div>

          <div class="grid grid-cols-2 gap-3 text-center">
            <button onclick="window.HAppWorkflow.acquireGPSForDetail('${p.areaName || ''}', ${p.rowId})" class="p-3 bg-white/5 rounded-2xl border border-white/10 text-xs font-bold text-white flex flex-col items-center gap-1">
              <span class="text-lg">📍</span>
              <span>${gpsText}</span>
            </button>
            <button onclick="window.HAppWorkflow.capturePhotoForDetail('${p.areaName || ''}', ${p.rowId})" class="p-3 bg-white/5 rounded-2xl border border-white/10 text-xs font-bold text-white flex flex-col items-center gap-1">
              <span class="text-lg">📸</span>
              <span>${photoText}</span>
            </button>
          </div>

          <button onclick="window.HAppWorkflow.commitDistribution('${p.areaName || ''}', ${p.rowId})" class="btn-neu w-full py-5 bg-[#22c55e] text-white text-base font-black rounded-2xl shadow-xl">
            ✅ 配布を完了する
          </button>
        </div>
      `;
    }

    return `
      ${addressHeaderHtml}
      <div class="space-y-4 pt-4 text-center">
        <div class="bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-2xl p-6 space-y-2">
          <span class="text-xs font-black text-[#22c55e] uppercase tracking-widest block">🔒 MISSION COMPLETED</span>
          <div class="text-3xl font-black text-white font-mono">${p.count || 0} 枚</div>
          <p class="text-xs text-white/40 font-medium">${p.completedAt ? formatCompletedAt(p.completedAt) : ''}</p>
        </div>
        <button onclick="window.HAppWorkflow.closeDetailModal()" class="w-full py-4 bg-white/10 text-white font-black rounded-2xl text-xs uppercase">閉じる</button>
      </div>
    `;
  }

  // 7. 提出確認モーダル
  function renderConfirmModal(areaName, p) {
    const modal = $('confirm-modal');
    const content = $('confirm-modal-content');
    if (!modal || !content) return;

    const cleanAddr = getCleanAddress(p.address || p.name || `地点 #${p.rowId}`);
    const count = p.count || 0;
    const hasPhoto = !!p.tempPhotoUrl || !!p.photoBase64;
    const hasGps = !!p.gps;

    content.innerHTML = `
      <h3 class="text-lg font-black text-white mb-4 text-center tracking-tight">配布実績の提出確認</h3>
      <div class="space-y-3 bg-white/5 rounded-2xl p-4 text-left border border-white/10">
        <div class="flex justify-between items-center text-xs">
          <span class="font-bold text-white/40">お届け先</span>
          <span class="font-black text-white">${cleanAddr}</span>
        </div>
        <div class="flex justify-between items-center text-xs">
          <span class="font-bold text-white/40">配布枚数</span>
          <span class="font-black text-[#2563eb] text-base font-mono">${count} 枚</span>
        </div>
        <div class="flex justify-between items-center text-xs">
          <span class="font-bold text-white/40">証跡写真</span>
          <span class="font-bold ${hasPhoto ? 'text-[#22c55e]' : 'text-white/40'}">${hasPhoto ? '✓ 添付あり' : 'なし'}</span>
        </div>
        <div class="flex justify-between items-center text-xs">
          <span class="font-bold text-white/40">GPS位置情報</span>
          <span class="font-bold ${hasGps ? 'text-[#22c55e]' : 'text-white/40'}">${hasGps ? '✓ 測位済み' : '未取得'}</span>
        </div>
      </div>

      <div class="flex gap-3 mt-6">
        <button onclick="window.HAppWorkflow.closeConfirmModal()" class="flex-1 py-4 rounded-2xl bg-white/10 text-xs font-black text-white/60">戻る</button>
        <button onclick="window.HAppWorkflow.executeCommitDistribution('${areaName}', ${p.rowId})" class="flex-1 py-4 rounded-2xl bg-[#2563eb] text-xs font-black text-white shadow-xl">送信確定</button>
      </div>
    `;

    modal.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
  }

  window.HAppRender = {
    renderAreas,
    renderDetailList,
    renderSettings,
    renderRanking,
    renderStorageList,
    renderDetailModalContent,
    renderConfirmModal,
    getCleanAddress,
    normalizeAreasForDisplay
  };
})(window);
