function formatCompletedAt(dateStr) {
  if (!dateStr) return '';
  if (/^\d{2}\/\d{2} \d{2}:\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    return dateStr;
  }
  const MM = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const HH = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${MM}/${dd} ${HH}:${mm}`;
}

function getCityName(areaName) {
  if (!areaName) return 'その他';
  if (areaName.startsWith('四日市')) return '四日市市';
  if (areaName.startsWith('鈴鹿')) return '鈴鹿市';
  if (areaName.startsWith('亀山')) return '亀山市';
  if (areaName.startsWith('菰野')) return '菰野町';
  const match = areaName.match(/^[^市町\(\d]+(?:市|町)/);
  if (match) return match[0];
  return areaName + '市';
}

function renderAreas() {
  if (!areaSummary || areaSummary.length === 0) {
    $('area-list').innerHTML = '<p class="text-center text-white/40 py-20 font-bold">データがありません。<br>一括作成を実行してください。</p>';
    return;
  }

  if (currentCity === null) {
    // 【第1層：市・自治体一覧画面】
    const cityMap = {};
    areaSummary.forEach(s => {
      const cityName = getCityName(s.name);
      if (!cityMap[cityName]) {
        cityMap[cityName] = { name: cityName, done: 0, total: 0 };
      }
      cityMap[cityName].done += s.done || 0;
      cityMap[cityName].total += s.total || 0;
    });

    const cities = Object.values(cityMap).map(c => {
      c.progress = c.total > 0 ? Math.round((c.done / c.total) * 100) : 0;
      return c;
    });

    const headerCardHtml = `
      <div style="border: 1px solid rgba(37, 99, 235, 0.35); box-shadow: inset 0 0 15px rgba(37, 99, 235, 0.08), 0 0 25px rgba(37, 99, 235, 0.12);" class="premium-glass p-6 flex flex-col items-center justify-center text-center gap-2 mb-6">
        <div class="w-12 h-12 rounded-2xl bg-[#2563eb]/10 border border-[#2563eb]/20 flex items-center justify-center shadow-lg shadow-[#2563eb]/10 mb-1">
          <svg class="w-6 h-6 text-[#2563eb]" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        <div class="text-lg font-black text-white tracking-tight">全体エリア</div>
        <div class="text-[9px] font-bold text-[#2563eb] uppercase tracking-[0.2em]">Field Operations</div>
      </div>
    `;

    const cityCardsHtml = cities.map(c => {
      const dotStyle = 'background-color: #22c55e; box-shadow: 0 0 12px rgba(34, 197, 94, 0.6);';
      const pctColorClass = 'text-[#2563eb]';
      const doneStr = String(c.done);
      const totalStr = String(c.total);
      const paddedDone = doneStr.padStart(totalStr.length, ' ');
      return `
      <div class="clickable-card premium-glass p-6 flex flex-col items-center justify-center text-center gap-2" onclick="selectCity('${c.name}')">
        <div style="${dotStyle}" class="w-2.5 h-2.5 rounded-full mb-1"></div>
        <div class="text-lg font-black text-white tracking-tight">${c.name}</div>
        <div class="text-[9px] font-bold text-white/40 uppercase tracking-widest flex items-center justify-center gap-1"><span class="${pctColorClass}">${c.progress}%</span> Completed <span class="text-white/20 font-medium font-mono whitespace-pre">(${paddedDone}/${c.total})</span></div>
      </div>`;
    }).join('');

    $('area-list').innerHTML = headerCardHtml + `<div class="space-y-6">${cityCardsHtml}</div>`;
  } else {
    // 【第2層：選択された市のエリアシート一覧画面】
    const filteredAreas = areaSummary.filter(s => getCityName(s.name) === currentCity);

    const backButtonHtml = `
      <div class="flex items-center mb-6 h-12">
        <button onclick="backToCityList()" class="w-12 h-12 premium-glass-btn flex items-center justify-center text-xl font-bold">‹</button>
      </div>
    `;

    const areaCardsHtml = filteredAreas.map(s => {
      const dotStyle = 'background-color: #22c55e; box-shadow: 0 0 12px rgba(34, 197, 94, 0.6);';
      const pctColorClass = 'text-[#2563eb]';
      const doneStr = String(s.done || 0);
      const totalStr = String(s.total || 0);
      const paddedDone = doneStr.padStart(totalStr.length, ' ');
      return `
      <div class="clickable-card premium-glass p-6 flex flex-col items-center justify-center text-center gap-2" onclick="openDetail('${s.name}')">
        <div style="${dotStyle}" class="w-2.5 h-2.5 rounded-full mb-1"></div>
        <div class="text-lg font-black text-white tracking-tight">${s.name}</div>
        <div class="text-[9px] font-bold text-white/40 uppercase tracking-widest flex items-center justify-center gap-1"><span class="${pctColorClass}">${s.progress}%</span> Completed <span class="text-white/20 font-medium font-mono whitespace-pre">(${paddedDone}/${s.total || 0})</span></div>
      </div>`;
    }).join('');

    const bottomBackButtonHtml = filteredAreas.length > 3 ? `
      <div class="flex items-center justify-start mt-8 pb-10">
        <button onclick="backToCityList()" class="w-12 h-12 premium-glass-btn flex items-center justify-center text-xl font-bold">‹</button>
      </div>
    ` : '';

    $('area-list').innerHTML = backButtonHtml + `<div class="space-y-6">${areaCardsHtml}</div>` + bottomBackButtonHtml;
  }
}

function selectCity(cityName) {
  currentCity = cityName;
  renderAreas();
  const contentEl = $('content'// Open point detail modal
function openPointDetailModal(rowId) {
  const p = allPoints.find(point => point.rowId === rowId);
  if (!p) return;

  window.currentPointDetailRowId = rowId;
  const modalContent = $('detail-modal-content');
  if (modalContent) {
    modalContent.innerHTML = renderDetailModalContent(p);
  }

  const modal = $('detail-modal');
  modal.classList.remove('pointer-events-none', 'opacity-0');
  modal.firstElementChild.classList.remove('translate-y-full');
}

// Close point detail modal
function closeDetailModal() {
  const modal = $('detail-modal');
  if (!modal) return;
  modal.classList.add('opacity-0', 'pointer-events-none');
  modal.firstElementChild.classList.add('translate-y-full');
  window.currentPointDetailRowId = null;
}

// Render single point detail modal contents
function renderDetailModalContent(p) {
  const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
  const myId = userInfo.id || '';
  const myName = `${userInfo.last || ''} ${userInfo.first || ''}`.trim();
  
  // 他人の完了実績か判定
  const isOtherStaff = p.isDone && (
    (p.staffId && p.staffId !== myId) ||
    (!p.staffId && p.staffName && p.staffName !== myName)
  );

  // GPS接続バッジ
  let gpsBadgeHtml = '';
  if (p.isDone) {
    if (p.gps) {
      gpsBadgeHtml = `
        <span class="inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-black text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-full tracking-wider">
          <span class="w-1.5 h-1.5 bg-[#22c55e] rounded-full animate-pulse shadow-[0_0_6px_#22c55e]"></span>
          GPS SECURED
        </span>
      `;
    } else {
      gpsBadgeHtml = `
        <span class="inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-black text-white/30 bg-white/5 border border-white/10 rounded-full tracking-wider">
          NO GPS DATA
        </span>
      `;
    }
  }

  // 非同期送信ステータスバッジ
  let syncLabelHtml = '';
  if (p.isDone) {
    if (p.syncStatus === 'sending') {
      syncLabelHtml = `<span class="text-[8px] font-black text-[#2563eb] animate-pulse tracking-widest bg-[#2563eb]/10 px-2 py-0.5 rounded-full ml-auto">FIELD DATA SYNCING...</span>`;
    } else if (p.syncStatus === 'failed') {
      syncLabelHtml = `<span class="text-[8px] font-black text-red-500 animate-pulse tracking-widest bg-red-500/10 px-2 py-0.5 rounded-full ml-auto">UPLOAD RETRYING...</span>`;
    } else if (p.syncStatus === 'pending') {
      syncLabelHtml = `<span class="text-[8px] font-black text-white/40 animate-pulse tracking-widest bg-white/5 px-2 py-0.5 rounded-full ml-auto">SYNC PENDING...</span>`;
    }
  }

  // 🔒アイコン
  const lockIconHtml = isOtherStaff ? `<span class="text-xs mr-1">🔒</span>` : '';

  // 写真表示・追加・変更ブロック
  const photoId = p.photoUrl || '';
  const tempUrl = p.tempPhotoUrl || '';
  let photoBlockHtml = '';
  if (p.isDone) {
    if (tempUrl) {
      photoBlockHtml = `
        <div class="relative w-full h-40 rounded-2xl overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center">
          <img src="${tempUrl}" class="w-full h-full object-cover">
        </div>
      `;
    } else if (photoId) {
      photoBlockHtml = `
        <div class="flex items-center justify-between p-4 rounded-2xl bg-[#2563eb]/05 border border-[#2563eb]/15">
          <div class="flex items-center gap-2">
            <span class="text-sm">📸</span>
            <span class="text-[9px] font-black text-[#2563eb] uppercase tracking-[0.2em]">PHOTO SENT</span>
          </div>
          ${!isOtherStaff ? `
            <button onclick="addPhotoToDetail(${p.rowId})" class="text-[10px] font-black text-[#2563eb] uppercase tracking-wider bg-[#2563eb]/10 px-3 py-1.5 rounded-xl border border-[#2563eb]/20 active:scale-95 transition-all">写真を変更</button>
          ` : ''}
        </div>
      `;
    } else {
      photoBlockHtml = `
        <div class="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
          <div class="flex items-center gap-2">
            <span class="text-sm text-white/30">📸</span>
            <span class="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">NO EVIDENCE PHOTO</span>
          </div>
          ${!isOtherStaff ? `
            <button onclick="addPhotoToDetail(${p.rowId})" class="text-[10px] font-black text-white/80 uppercase tracking-wider bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 active:scale-95 transition-all">📸 写真を追加</button>
          ` : ''}
        </div>
      `;
    }
  }

  // ロック状態によるスタイル分岐
  const labelClasses = isOtherStaff
    ? "rounded-3xl p-5 flex items-center gap-5 cursor-default bg-white/[0.01] border border-white/[0.03]"
    : `rounded-3xl p-5 flex items-center gap-5 cursor-pointer active:scale-[0.98] transition-all bg-white/5 border border-white/10`;
  
  const labelStyle = !isOtherStaff && p.isDone
    ? 'background: rgba(16,185,129,0.05); border: 1px solid rgba(16,185,129,0.2);'
    : '';

  const areaName = window.currentCityDetailAreaName || '';

  return `
    <div class="flex justify-between items-start gap-4">
      <div class="flex-1 space-y-2 min-w-0">
        <div class="text-lg font-black text-white tracking-tight leading-tight select-text">${p.address}</div>
        ${p.memo ? `<div class="text-xs text-white/50 bg-white/5 rounded-xl p-3 border border-white/5 select-text">${p.memo}</div>` : ''}
      </div>
      <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.address)}" target="_blank" class="w-14 h-14 premium-glass-btn flex items-center justify-center text-xl shrink-0">📍</a>
    </div>
    
    <div class="flex flex-col gap-4">
      <label ${labelStyle ? `style="${labelStyle}"` : ''} class="${labelClasses}">
        <input type="checkbox" class="hidden" ${p.isDone?'checked':''} ${isOtherStaff?'disabled':''} onchange="toggleDone('${areaName}', ${p.rowId}, this)">
        <div style="${p.isDone ? 'border-color: #10b981; background-color: #10b981; box-shadow: 0 0 10px rgba(16,185,129,0.4);' : 'border-color: rgba(255,255,255,0.2); background-color: transparent;'}" class="w-8 h-8 rounded-xl border flex items-center justify-center transition-all shrink-0">
          ${p.isDone ? '<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="4" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>' : ''}
        </div>
        <div class="flex-1 min-w-0 flex items-center justify-between">
          <div class="flex flex-col min-w-0">
            <div class="flex items-center gap-1">
              ${lockIconHtml}
              <span class="text-[10px] font-black uppercase tracking-widest ${p.isDone ? 'text-[#10b981]' : 'text-white/60'}">
                ${p.isDone ? 'MISSION COMPLETED' : 'READY TO DEPLOY'}
              </span>
            </div>
            ${p.isDone && p.completedAt ? `
              <div class="text-[10px] text-white/40 font-bold mt-1 tracking-wider uppercase truncate">${formatCompletedAt(p.completedAt)} ${p.staffName ? `· ${p.staffName}` : ''}</div>
            ` : ''}
          </div>
          ${syncLabelHtml}
        </div>
      </label>

      ${p.isDone ? `
        <div class="flex flex-wrap items-center gap-2">
          ${gpsBadgeHtml}
        </div>
        
        ${photoBlockHtml}

        <div class="flex justify-between items-center bg-white/5 border border-white/5 rounded-2xl p-5">
          <div class="flex items-baseline">
            <span class="text-3xl font-black text-white tracking-tight">${p.count || 0}</span>
            <span class="text-xs font-bold text-white/60 ml-1">枚</span>
          </div>
          ${!isOtherStaff ? `
            <button onclick="openNumpad('${areaName}', ${p.rowId}, ${p.count || 0})" class="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white/80 active:scale-95 transition-all">枚数変更</button>
          ` : ''}
        </div>
      ` : ''}
    </div>
  `;
}

// Render the entire details list using global allPoints (1-line simple card)
function renderDetailList(areaName) {
  const cardsHtml = allPoints.map((p, i) => {
    const statusDot = p.isDone 
      ? 'background-color: #10b981; box-shadow: 0 0 10px rgba(16, 185, 129, 0.6);' 
      : 'background-color: rgba(255, 255, 255, 0.2);';
    const statusText = p.isDone ? '完了' : '未完了';
    const statusColor = p.isDone ? 'text-[#10b981]' : 'text-white/40';
    return `
      <div class="clickable-card premium-glass p-5 flex items-center justify-between gap-4" onclick="openPointDetailModal(${p.rowId})">
        <div class="flex-1 min-w-0">
          <div class="text-sm font-black text-white truncate leading-tight">${p.address}</div>
          <div class="text-[9px] font-bold ${statusColor} uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
            <span style="${statusDot}" class="w-1.5 h-1.5 rounded-full inline-block"></span>
            ${statusText} ${p.isDone && p.count ? `· ${p.count}枚` : ''}
          </div>
        </div>
        <div class="text-white/30 text-lg shrink-0">›</div>
      </div>`;
  }).join('');

  // リストの最下部（左下）に戻るボタンを追加
  const bottomBackButtonHtml = `
    <div class="flex items-center justify-start mt-8 pb-10">
      <button onclick="switchPage('areas')" class="w-12 h-12 premium-glass-btn flex items-center justify-center text-xl font-bold">‹</button>
    </div>
  `;

  $('detail-list').innerHTML = `<div class="space-y-4">${cardsHtml}</div>` + bottomBackButtonHtml;
}

async function openDetail(name) {
  $('loading').classList.remove('hidden');
  $('loading').classList.remove('opacity-0');
  
  await new Promise(r => setTimeout(r, 50));
  
  try {
    const data = await callApi('getAreaDetails', { name: name });
    if (data && data.points) {
      window.currentCityDetailAreaName = name;
      allPoints = data.points;
      renderDetailList(name);
      
      // 新しい地区を開くため、詳細画面のスクロール位置をキャッシュからクリア
      if (typeof scrollPositions !== 'undefined') {
        scrollPositions['detail'] = 0;
      }
      
      switchPage('detail');
    }
  } catch (e) {
    alert("詳細データの取得に失敗しました。");
  }
  
  $('loading').classList.add('opacity-0');
  setTimeout(() => $('loading').classList.add('hidden'), 700);
}

function toggleDone(areaName, rowId, checkbox) {
  const p = allPoints.find(point => point.rowId === rowId);
  if (!p) return;
  
  if (checkbox.checked) {
    // Open numpad modal
    openNumpad(areaName, rowId, p.count || 0, true, checkbox);
  } else {
    // 誤操作防止の削除確認ダイアログ
    if (!confirm("完了実績をキャンセルしますか？\n入力された配布枚数もクリアされます。")) {
      checkbox.checked = true; // キャンセルされたらチェック状態を元に戻す
      return;
    }
    
    // Directly clear completion and count
    p.isDone = false;
    p.count = 0;
    p.completedAt = '';
    p.staffName = '';
    delete p.syncStatus;
    delete p.tempPhotoUrl;
    
    // Update local card list
    renderDetailList(areaName);
    
    // Update active modal content
    const modalContent = $('detail-modal-content');
    if (modalContent) {
      modalContent.innerHTML = renderDetailModalContent(p);
    }
    
    // Send update to server
    updateRecord(areaName, rowId, false, 0);
  }
}

function renderSettings() {
  const userInfo = JSON.parse(localStorage.getItem('user_info'));
  const container = $('settings-content');
  
  if (!userInfo) {
    // Card 1: Registration (Absolute alignment with Splash Model)
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center -mt-10 pb-12 px-4">
        <div class="mb-8 text-center">
          <p class="text-sm text-white/70 leading-relaxed">
            <span class="font-black">お名前を登録して</span><br>
            <span class="font-medium">ください</span>
          </p>
        </div>
        <div class="w-full premium-glass p-8 space-y-8 text-left">
          <div class="space-y-4">
            <div>
              <label style="color: rgba(255,255,255,0.72);" class="text-[11px] font-black uppercase tracking-[0.2em] mb-2 block text-center">名前</label>
              <input type="text" id="user-last" style="background: #ffffff; border: 1px solid rgba(0, 0, 0, 0.15); color: #000000;" class="w-full rounded-2xl py-6 px-7 text-lg font-black text-left outline-none focus:border-[#2563eb] transition-all shadow-xl placeholder-gray-400" placeholder="例：鈴木一郎">
            </div>
            <div>
              <label style="color: rgba(255,255,255,0.72);" class="text-[11px] font-black uppercase tracking-[0.2em] mb-2 block text-center">アプリ名</label>
              <input type="text" id="user-first" style="background: #ffffff; border: 1px solid rgba(0, 0, 0, 0.15); color: #000000;" class="w-full rounded-2xl py-6 px-7 text-lg font-black text-left outline-none focus:border-[#2563eb] transition-all shadow-xl placeholder-gray-400" placeholder="例：すずき（LINE）">
            </div>
          </div>
          
          <div class="pt-2">
            <button onclick="saveProfile()" class="btn-neu w-full bg-[#2563eb] text-white rounded-2xl py-6 text-lg font-black shadow-xl transition-all">登録を完了する</button>
          </div>
        </div>
      </div>
    `;
  } else {
    // Card 2: Distributor ID Card (Standardized to Splash Model)
    const avatarHtml = userInfo.picture ? `
      <div class="w-24 h-24 rounded-full overflow-hidden border-2 border-white/20 shadow-2xl mb-4 relative z-10">
        <img src="${userInfo.picture}" class="w-full h-full object-cover">
      </div>
    ` : `
      <div class="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 relative z-10">
        <span class="text-3xl text-white/40">👤</span>
      </div>
    `;

    const formattedId = userInfo.id ? userInfo.id.replace(/^[A-Za-z]+/, 'STAFF ID ') : '';
    const rawBranch = localStorage.getItem('branch_name') || '';
    const displayBranch = rawBranch ? (rawBranch.includes('支部') ? rawBranch : `${rawBranch} 支部`) : '';

    container.innerHTML = `
      <div class="pt-2 pb-0 px-4 flex flex-col items-center">
        <div class="mb-6 flex items-center justify-center gap-3">
          <span class="text-xs font-bold text-white/50 tracking-wider">公式配布員</span>
          ${formattedId ? `<span style="letter-spacing: 0.15em; text-indent: 0.15em; background: linear-gradient(180deg, rgba(37,99,235,0.16), rgba(37,99,235,0.06)); border: 1px solid rgba(37,99,235,0.3); box-shadow: inset 0 1px 0 rgba(255,255,255,0.15), inset 0 0 6px rgba(37,99,235,0.35), 0 0 12px rgba(37,99,235,0.25); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);" class="inline-flex items-center justify-center h-6 px-3 text-[10px] font-black text-[#2563eb] font-mono rounded-full">${formattedId}</span>` : ''}
        </div>
        
        <div id="id-gyro-card" style="--glow-x: 0px; --glow-y: 0px; --glow-opacity: 0.08; --edge-opacity: 0.08; --edge-angle: 180deg;" class="w-full max-w-sm h-[300px] gyro-card flex flex-col items-center justify-between p-6 relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-b from-white/5 to-white/0 pointer-events-none rounded-[28px]"></div>
          
          <div class="inline-flex items-center gap-2 z-10 mt-2">
            <span class="w-2 h-2 bg-[#22c55e] rounded-full shadow-[0_0_8px_#22c55e]"></span>
            <span class="text-[8px] font-black text-[#22c55e] uppercase tracking-[0.3em]">Authorized Staff</span>
          </div>
          
          <div class="flex flex-col items-center z-10 my-auto w-full max-w-[280px]">
            ${avatarHtml}
            <div style="font-size: 28px; font-weight: 900; color: #ffffff; text-align: center; letter-spacing: 0.05em; line-height: 1.1;" class="flex flex-col items-center w-full">
              <div class="truncate w-full">${userInfo.last}</div>
              <div class="text-xs text-white/40 font-medium mt-1 truncate w-full">${userInfo.first || ''}</div>
            </div>
          </div>
          
          <div class="flex flex-col items-center gap-1 z-10">
            ${displayBranch ? `<p class="text-[8px] font-black text-white/40 uppercase tracking-[0.3em]">${displayBranch}</p>` : ''}
            <p class="text-[8px] font-black text-white/40 uppercase tracking-[0.3em]">Field Operations</p>
            <p class="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] mt-2 select-none">
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

function renderRanking() {
  const container = $('ranking-list');
  if (!container) return;

  const headerCardHtml = `
    <div style="border: 1px solid rgba(37, 99, 235, 0.35); box-shadow: inset 0 0 15px rgba(37, 99, 235, 0.08), 0 0 25px rgba(37, 99, 235, 0.12);" class="premium-glass p-6 flex flex-col items-center justify-center text-center gap-2 mb-6">
      <div class="w-12 h-12 rounded-2xl bg-[#2563eb]/10 border border-[#2563eb]/20 flex items-center justify-center shadow-lg shadow-[#2563eb]/10 mb-1">
        <svg class="w-6 h-6 text-[#2563eb]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 14.25c3.976 0 7.25-3.274 7.25-7.25V4.75a.75.75 0 00-.75-.75H5.5a.75.75 0 00-.75.75V7c0 3.976 3.274 7.25 7.25 7.25zM12 14.25v4.5m-3 0h6m-9-11.25H4.25A1.25 1.25 0 003 8.75V9.5c0 1.657 1.343 3 3 3h.25M18 7.5h1.75A1.25 1.25 0 0121 8.75V9.5c0 1.657-1.343 3-3 3h-.25" />
        </svg>
      </div>
      <div class="text-lg font-black text-white tracking-tight">配布ランキング</div>
      <div class="text-[9px] font-bold text-[#2563eb] uppercase tracking-[0.2em]">Leaderboard</div>
    </div>
  `;

  const userInfo = JSON.parse(localStorage.getItem('user_info'));
  const myName = userInfo ? (userInfo.last + " " + (userInfo.first || "")).trim() : "";

  // APIから取得した実データを優先的に使用
  const displayRanking = (typeof rankingData !== 'undefined' && rankingData) ? rankingData : [];

  let myRank = -1;
  let myCount = 0;
  if (myName) {
    const idx = displayRanking.findIndex(r => r.name === myName);
    if (idx !== -1) {
      myRank = idx + 1;
      myCount = displayRanking[idx].count;
    } else {
      myRank = "圏外";
      myCount = 0;
    }
  }

  // 1. 本人のステータスカード（ID登録されている場合のみ表示）
  const myStatusCardHtml = myName ? `
    <div style="border: 1px solid rgba(255, 255, 255, 0.04);" class="premium-glass p-6 flex items-center justify-between mb-6">
      <div>
        <p class="text-[9px] font-black text-[#22c55e] uppercase tracking-widest">My Performance</p>
        <h4 class="text-sm font-black text-white tracking-tight mt-0.5">${myName}</h4>
      </div>
      <div class="text-right">
        <p class="text-[9px] font-black text-white/40 uppercase tracking-widest">現在の順位</p>
        <h4 class="text-sm font-black text-white tracking-tight mt-0.5">
          ${myRank === "圏外" ? '<span class="text-white/40">圏外</span>' : `${myRank}<span class="text-xs text-white/60 ml-0.5">位</span>`}
        </h4>
      </div>
    </div>
  ` : '';

  // 2. ランキングリストが空の場合の美麗プレースホルダー
  if (displayRanking.length === 0) {
    container.innerHTML = headerCardHtml + myStatusCardHtml + `
      <div style="border: 1px solid rgba(255, 255, 255, 0.04);" class="premium-glass p-8 flex flex-col items-center justify-center text-center gap-3">
        <span class="text-3xl">🏆</span>
        <div class="text-sm font-black text-white/80">まだ配布ランキングがありません</div>
        <p class="text-[10px] text-white/40 font-bold leading-relaxed uppercase tracking-wider">
          ポスティング完了が記録されると<br>
          ここにランキングが表示されます
        </p>
      </div>
    `;
    return;
  }

  // 3. ランキング項目のレンダリング
  const itemsHtml = displayRanking.map((r, index) => {
    const rank = index + 1;
    const isMe = myName && r.name === myName;
    
    let cardStyle = '';
    let rankBadgeClass = '';
    let glowDotHtml = '';

    if (rank === 1) {
      cardStyle = 'border: 1px solid rgba(250, 204, 21, 0.35); box-shadow: inset 0 0 15px rgba(250, 204, 21, 0.08), 0 0 25px rgba(250, 204, 21, 0.12);';
      rankBadgeClass = 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
      glowDotHtml = '<span class="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse mr-2 shadow-[0_0_8px_#eab308]"></span>';
    } else if (rank === 2) {
      cardStyle = 'border: 1px solid rgba(226, 232, 240, 0.3); box-shadow: inset 0 0 12px rgba(226, 232, 240, 0.06), 0 0 20px rgba(226, 232, 240, 0.08);';
      rankBadgeClass = 'bg-slate-300/10 text-slate-300 border border-slate-300/20';
      glowDotHtml = '<span class="w-1.5 h-1.5 rounded-full bg-slate-300 mr-2 shadow-[0_0_6px_#cbd5e1]"></span>';
    } else if (rank === 3) {
      cardStyle = 'border: 1px solid rgba(217, 119, 6, 0.3); box-shadow: inset 0 0 12px rgba(217, 119, 6, 0.06), 0 0 20px rgba(217, 119, 6, 0.08);';
      rankBadgeClass = 'bg-amber-600/10 text-amber-500 border border-amber-600/20';
      glowDotHtml = '<span class="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 shadow-[0_0_6px_#f59e0b]"></span>';
    } else {
      cardStyle = isMe 
        ? 'border: 1px solid rgba(37, 99, 235, 0.4); box-shadow: inset 0 0 12px rgba(37, 99, 235, 0.1), 0 0 20px rgba(37, 99, 235, 0.15);' 
        : 'border: 1px solid rgba(255, 255, 255, 0.04);';
      rankBadgeClass = isMe 
        ? 'bg-[#2563eb]/20 text-[#2563eb] border border-[#2563eb]/30' 
        : 'bg-white/5 text-white/50 border border-white/5';
      glowDotHtml = isMe 
        ? '<span class="w-1.5 h-1.5 rounded-full bg-[#2563eb] animate-pulse mr-2 shadow-[0_0_8px_#2563eb]"></span>' 
        : '';
    }

    return `
      <div style="${cardStyle}" class="premium-glass p-6 flex items-center justify-between transition-all">
        <div class="flex items-center">
          <div class="h-8 px-3 rounded-full flex items-center justify-center font-mono font-black text-xs ${rankBadgeClass} mr-4">
            ${glowDotHtml}
            ${rank}位
          </div>
          <div class="flex flex-col">
            <span class="text-sm font-black ${isMe ? 'text-white' : 'text-white/80'}">${r.name}${isMe ? '<span class="text-[9px] font-black uppercase text-[#2563eb] tracking-widest ml-2 bg-[#2563eb]/10 px-2 py-0.5 rounded-full">YOU</span>' : ''}</span>
          </div>
        </div>
        <div class="flex items-baseline">
          <span class="text-xl font-black text-white tracking-tight">${r.count.toLocaleString()}</span>
          <span class="text-[9px] font-bold text-white/40 ml-1">枚</span>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = headerCardHtml + myStatusCardHtml + `<div class="space-y-4">${itemsHtml}</div>`;
}
