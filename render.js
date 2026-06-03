// 住所から郵便番号(〒000-0000およびその後の改行/スペース)を除去したクリーンな住所を返す
function getCleanAddress(addr) {
  if (!addr) return '';
  return addr.replace(/^〒\d{3}-\d{4}\s*/, '');
}

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
  // 注意: 以下のハードコードは「四日市(市)」のようにエリア名に「市」が含まれる特殊ケースへの対処。
  // 正規表現 /^[^市町...]/ では「四日市」と不完全にマッチするため意図的に残している。
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
      <div style="border: 1px solid rgba(37, 99, 235, 0.35); box-shadow: inset 0 0 15px rgba(37, 99, 235, 0.08), 0 0 25px rgba(37, 99, 235, 0.12);" class="premium-glass py-5 px-6 flex flex-col items-center justify-center text-center gap-2 mb-6">
        <div class="w-8 h-8 rounded-xl bg-[#2563eb]/10 border border-[#2563eb]/20 flex items-center justify-center shadow-lg shadow-[#2563eb]/10 mb-0.5">
          <svg class="w-4 h-4 text-[#2563eb]" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        <div class="text-lg font-black text-white tracking-tight">全体エリア</div>
      </div>
    `;

    const cityCardsHtml = cities.map(c => {
      const pctColorClass = 'text-[#2563eb]';
      const isCompleted = c.done === c.total && c.total > 0;
      const leftDummy = isCompleted ? '<span style="visibility: hidden; margin-right: 12px;" class="select-none text-[9px] font-sans">🔒 VERIFIED</span>' : '';
      const rightLabel = isCompleted ? '<span style="margin-left: 12px;" class="font-sans text-[9px] opacity-90">🔒 VERIFIED</span>' : '';

      // 市名の文字数に応じてフォントサイズを自動調整（折り返し・はみ出し防止）
      let fontSizeClass = 'text-lg';
      if (c.name.length > 12) {
        fontSizeClass = 'text-xs';
      } else if (c.name.length > 8) {
        fontSizeClass = 'text-sm';
      } else if (c.name.length > 5) {
        fontSizeClass = 'text-base';
      }

      return `
      <div class="clickable-card premium-glass py-5 px-6 flex flex-col items-center text-center gap-1.5" onclick="selectCity('${c.name}')">
        <div class="w-full flex justify-center mb-1">
          <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08);" class="inline-flex items-center justify-center h-7 px-3 ${fontSizeClass} font-black text-white rounded-full tracking-tight">
            <span class="text-xs mr-1 select-none">🏢</span>
            <span>${c.name}</span>
          </div>
        </div>
        <div class="text-sm ${pctColorClass}">${c.progress}%</div>
        <div class="flex items-center justify-center w-full">
          ${leftDummy}
          <div style="background: rgba(34, 197, 94, 0.08); border: 1px solid rgba(34, 197, 94, 0.25); height: 22px; font-size: 10px; color: #22c55e;" class="inline-flex items-center justify-center px-2.5 font-bold rounded-full tracking-wider font-mono">
            ${c.done}/ ${c.total}
          </div>
          ${rightLabel}
        </div>
        <!-- 🗺 Google マップで市全体を確認するボタン -->
        <button
          ontouchstart=""
          onclick="event.stopPropagation(); window.open('https://www.google.com/maps/search/${encodeURIComponent(c.name + ' 日本')}', '_blank')"
          style="background: rgba(37,99,235,0.06); border: 1px solid rgba(37,99,235,0.2); color: rgba(37,99,235,0.9); transition: transform 75ms ease-out, background 75ms ease-out;"
          onpointerdown="this.style.transform='scale(0.94)'; this.style.background='rgba(37,99,235,0.14)'"
          onpointerup="this.style.transform=''; this.style.background='rgba(37,99,235,0.06)'"
          onpointerleave="this.style.transform=''; this.style.background='rgba(37,99,235,0.06)'"
          class="mt-1 w-full h-8 rounded-xl flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-widest select-none">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
          </svg>
          ${c.name}を地図で見る
        </button>
      </div>`;
    }).join('');

    // 1層目の最下部にスムーズスクロールで上部に戻る「↑ トップに戻る」ボタンを追加
    const bottomTopButtonHtml = `
      <div class="flex items-center justify-center mt-8 pb-10">
        <button onclick="$('content').scrollTo({top: 0, behavior: 'smooth'})" class="px-6 h-12 premium-glass-btn flex items-center justify-center text-xs font-bold uppercase tracking-wider text-white/80">↑ トップに戻る</button>
      </div>
    `;

    $('area-list').innerHTML = headerCardHtml + `<div class="space-y-6">${cityCardsHtml}</div>` + bottomTopButtonHtml;
  } else {
    // 【第2層：選択された市のエリアシート一覧画面】
    const filteredAreas = areaSummary.filter(s => getCityName(s.name) === currentCity);

    const backButtonHtml = `
      <div class="flex items-center mb-6 h-12">
        <button onclick="backToCityList()" class="w-12 h-12 premium-glass-btn flex items-center justify-center text-xl font-bold">‹</button>
      </div>
    `;

    const areaCardsHtml = filteredAreas.map(s => {
      const pctColorClass = 'text-[#2563eb]';
      const isCompleted = s.done === s.total && s.total > 0;
      const leftDummy = isCompleted ? '<span style="visibility: hidden; margin-right: 12px;" class="select-none text-[9px] font-sans">🔒 VERIFIED</span>' : '';
      const rightLabel = isCompleted ? '<span style="margin-left: 12px;" class="font-sans text-[9px] opacity-90">🔒 VERIFIED</span>' : '';
      
      // A2の代表住所を郵便番号と住所に分離して解析
      let zipCode = '';
      let cleanAddress = s.name;
      
      if (s.repAddress) {
        const match = s.repAddress.match(/^〒(\d{3}-\d{4})\s*([\s\S]*)$/);
        if (match) {
          zipCode = match[1];
          cleanAddress = match[2].trim().replace(/\r?\n/g, ' ');
        } else {
          cleanAddress = s.repAddress.replace(/\r?\n/g, ' ');
        }
      }

      // 郵便番号バッジHTML（郵便番号が存在する場合のみ生成）
      const zipBadgeHtml = zipCode 
        ? `<div style="text-indent: 0.12em; letter-spacing: 0.12em; background: rgba(37,99,235,0.08); border: 1px solid rgba(37,99,235,0.2);" class="inline-flex items-center justify-center h-6 px-3 text-[10px] font-black text-[#2563eb] font-mono rounded-full mb-1">📮 〒${zipCode}</div>`
        : '';

      // 住所の文字数に応じてフォントサイズを自動調整（折り返し・はみ出し防止）
      let fontSizeClass = 'text-base';
      if (cleanAddress.length > 12) {
        fontSizeClass = 'text-xs'; // 12文字超は小さめ (12px)
      } else if (cleanAddress.length > 8) {
        fontSizeClass = 'text-sm';  // 8〜12文字は中くらい (14px)
      }

      return `
      <div id="area-card-${s.name}" class="clickable-card premium-glass py-5 px-6 flex flex-col items-center text-center gap-1.5" onclick="openDetail('${s.name}')">
        ${zipBadgeHtml}
        <div class="${fontSizeClass} font-black text-white tracking-tight leading-snug w-full" style="text-wrap: balance;">
          <span>${cleanAddress}</span>
        </div>
        <div class="text-sm ${pctColorClass}">${s.progress}%</div>
        <div class="flex items-center justify-center w-full">
          ${leftDummy}
          <div style="background: rgba(34, 197, 94, 0.08); border: 1px solid rgba(34, 197, 94, 0.25); height: 22px; font-size: 10px; color: #22c55e;" class="inline-flex items-center justify-center px-2.5 font-bold rounded-full tracking-wider font-mono">
            ${s.done || 0}/ ${s.total || 0}
          </div>
          ${rightLabel}
        </div>
      </div>`;
    }).join('');

    // 2層目の最下部ナビゲーション（戻る ‹ / ↑ トップに戻る）
    const bottomNavHtml = filteredAreas.length > 3 ? `
      <div class="flex items-center justify-between mt-8 pb-10 w-full gap-4">
        <button onclick="backToCityList()" class="w-12 h-12 premium-glass-btn flex items-center justify-center text-xl font-bold">‹</button>
        <button onclick="$('content').scrollTo({top: 0, behavior: 'smooth'})" class="flex-1 h-12 premium-glass-btn flex items-center justify-center text-xs font-bold uppercase tracking-wider text-white/80">↑ トップに戻る</button>
        <div class="w-12 h-12"></div>
      </div>
    ` : `
      <div class="flex items-center justify-start mt-8 pb-10">
        <button onclick="backToCityList()" class="w-12 h-12 premium-glass-btn flex items-center justify-center text-xl font-bold">‹</button>
      </div>
    `;

    $('area-list').innerHTML = backButtonHtml + `<div class="space-y-6">${areaCardsHtml}</div>` + bottomNavHtml;
  }
}

function selectCity(cityName) {
  currentCity = cityName;
  renderAreas();
  const contentEl = $('content');
  if (contentEl) contentEl.scrollTop = 0;
}

// Open point detail modal
function openPointDetailModal(rowId) {
  const p = allPoints.find(point => point.rowId === rowId);
  if (!p) return;

  window.currentPointDetailRowId = rowId;
  const modalContent = $('detail-modal-content');
  if (modalContent) {
    modalContent.innerHTML = renderDetailModalContent(p);
    modalContent.scrollTop = 0; // スクロール位置を確実に一番上へリセット
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

  // 配布完了時は編集ロック
  const isLocked = p.isDone;

  // GPS接続バッジ
  let gpsBadgeHtml = '';
  if (p.isDone) {
    if (p.gps) {
      gpsBadgeHtml = `
        <!-- 【GPSあり】横幅いっぱいの青色カード型 (PHOTO VERIFIED と完全同一スタイル) -->
        <div style="background: rgba(37, 99, 235, 0.05); border: 1.5px solid rgba(37, 99, 235, 0.4); box-shadow: inset 0 0 0 1px rgba(37, 99, 235, 0.15), 0 0 30px rgba(37, 99, 235, 0.05);" class="w-full rounded-2xl py-4 px-5 flex flex-col items-center justify-center">
          <div class="flex items-center justify-center gap-2 w-full">
            <span class="text-sm">📍</span>
            <span class="text-[10px] font-black text-[#2563eb] uppercase tracking-[0.2em]">GPS VERIFIED</span>
          </div>
        </div>
      `;
    } else {
      gpsBadgeHtml = `
        <!-- 【GPSなし】横幅いっぱいのカード型 -->
        <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08);" class="w-full rounded-2xl py-4 px-5 flex flex-col items-center justify-center">
          <div class="flex items-center justify-center gap-2 w-full">
            <span class="text-sm opacity-30">📍</span>
            <span class="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">NO GPS DATA</span>
          </div>
        </div>
      `;
    }
  }

  // 非同期送信ステータスバッジ (要件8: PENDING / SYNCING / COMPLETE / RETRYING...)
  let syncLabelHtml = '';
  if (p.isDone) {
    const s = p.syncStatus;
    if (s === 'SYNCING' || s === 'sending') {
      syncLabelHtml = `<span class="text-[8px] font-black text-[#2563eb] animate-pulse tracking-widest bg-[#2563eb]/10 px-2 py-0.5 rounded-full ml-auto">FIELD DATA SYNCING...</span>`;
    } else if (s === 'RETRY' || s === 'failed') {
      syncLabelHtml = `<span class="text-[8px] font-black text-red-500 animate-pulse tracking-widest bg-red-500/10 px-2 py-0.5 rounded-full ml-auto">UPLOAD RETRYING...</span>`;
    } else if (s === 'PENDING' || s === 'pending') {
      syncLabelHtml = `<span class="text-[8px] font-black text-white/40 animate-pulse tracking-widest bg-white/5 px-2 py-0.5 rounded-full ml-auto">SYNC PENDING...</span>`;
    }
  }

  // 🔒アイコン
  const lockIconHtml = isLocked ? `<span class="text-xs mr-1">🔒</span>` : '';

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
        <!-- 【写真あり】青色（#2563eb）テーマの写真確認カード (コンパクト化・ボタン廃止・外枠青色化) -->
        <div style="background: rgba(37, 99, 235, 0.05); border: 1.5px solid rgba(37, 99, 235, 0.4); box-shadow: inset 0 0 0 1px rgba(37, 99, 235, 0.15), 0 0 30px rgba(37, 99, 235, 0.05);" class="w-full rounded-2xl py-4 px-5 flex flex-col items-center justify-center">
          <div class="flex items-center justify-center gap-2 w-full">
            <span class="text-sm">📸</span>
            <span class="text-[10px] font-black text-[#2563eb] uppercase tracking-[0.2em]">PHOTO VERIFIED</span>
          </div>
        </div>
      `;
    } else {
      photoBlockHtml = `
        <!-- 【写真なし】カメラアイコンを表示し、青色の追加ボタンを常時配置 -->
        <div class="flex flex-col items-center justify-center p-5 rounded-2xl bg-white/5 border border-white/10 gap-3">
          <div class="flex items-center justify-center gap-2 w-full">
            <span class="text-sm text-white/30">📸</span>
            <span class="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">NO EVIDENCE PHOTO</span>
          </div>
          <button onclick="addPhotoToDetail(${p.rowId})" class="w-full py-3 text-[10px] font-black text-[#2563eb] uppercase tracking-wider bg-[#2563eb]/10 rounded-xl border border-[#2563eb]/20 active:scale-95 transition-all">📸 写真を追加</button>
        </div>
      `;
    }
  }

  // ロック状態によるスタイル分岐
  const cardClasses = isOtherStaff
    ? "rounded-3xl p-5 flex items-center gap-5 bg-white/[0.01] border border-white/[0.03]"
    : "rounded-3xl p-5 flex items-center gap-5 bg-white/5 border border-white/10";
  
  const labelStyle = !isOtherStaff && p.isDone
    ? 'background: rgba(16,185,129,0.05); border: 1px solid rgba(16,185,129,0.2);'
    : '';

  const areaName = window.currentCityDetailAreaName || '';

  const cleanAddr = getCleanAddress(p.address);
  // 住所の文字数に応じてフォントサイズを自動調整（折り返し・はみ出し防止）
  let addrFontSizeClass = 'text-lg';
  if (cleanAddr.length > 16) {
    addrFontSizeClass = 'text-sm';
  } else if (cleanAddr.length > 10) {
    addrFontSizeClass = 'text-base';
  }

  // 完了済み(p.isDone)の場合はGoogle Mapsボタンを非表示にする
  const googleMapsButtonHtml = !p.isDone ? `
    <!-- 2行目: 横幅いっぱいのGoogle Mapsボタン -->
    <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanAddr)}" target="_blank" style="background: rgba(37, 99, 235, 0.08); border: 1px solid rgba(37, 99, 235, 0.25); color: #2563eb; box-shadow: inset 0 1px 0 rgba(255,255,255,0.1), inset 0 0 6px rgba(37,99,235,0.1), 0 0 12px rgba(37,99,235,0.05); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);" class="w-full h-12 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest rounded-2xl active:scale-[0.97] transition-all">
      📍 Googleマップで開く
    </a>
  ` : '';

  return `
    <!-- 1行目: 住所バッジ（中央寄せ） -->
    <div class="w-full flex flex-col items-center gap-3">
      <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); height: 26px; font-size: 12px; color: rgba(255, 255, 255, 0.9);" class="inline-flex items-center px-3 font-bold rounded-full tracking-wide truncate max-w-full select-text">
        🏠 ${cleanAddr}
      </div>
      ${p.memo ? `<div class="text-xs text-white/50 bg-white/5 rounded-xl p-3 border border-white/5 select-text w-full text-center mt-1">${p.memo}</div>` : ''}
    </div>
    
    ${googleMapsButtonHtml}
    
    <div class="flex flex-col gap-4">
      ${!p.isDone ? `
        <!-- 【未完了】全体がタップ可能な極上シンメトリーカード -->
        <label ontouchstart="" class="cursor-pointer rounded-3xl py-6 px-5 bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-4 w-full">
          <input type="checkbox" class="hidden" onchange="toggleDone('${areaName}', ${p.rowId}, this)">
          
          <!-- 1. テキスト（中央揃え） -->
          <div class="flex flex-col items-center select-none text-center">
            <span class="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">READY TO DEPLOY</span>
            <span class="text-xs font-bold text-white/40 mt-1 tracking-wider">タップで配布完了</span>
          </div>

          <!-- 2. チェックボックス（押した瞬間だけ沈み込む） -->
          <div ontouchstart="" style="border-color: #10b981; background-color: #10b981; box-shadow: 0 0 10px rgba(16,185,129,0.4); transition: transform 75ms ease-out, box-shadow 75ms ease-out, filter 75ms ease-out;" class="w-12 h-12 rounded-2xl border flex items-center justify-center select-none"
            onpointerdown="this.style.transform='scale(0.82)'; this.style.boxShadow='0 0 4px rgba(16,185,129,0.2)'; this.style.filter='brightness(0.85)'"
            onpointerup="this.style.transform=''; this.style.boxShadow='0 0 10px rgba(16,185,129,0.4)'; this.style.filter=''"
            onpointerleave="this.style.transform=''; this.style.boxShadow='0 0 10px rgba(16,185,129,0.4)'; this.style.filter=''">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" stroke-width="4" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
        </label>
      ` : `
        <!-- 【完了済み】編集ロックがかかった上品なグリーンステータス表示 -->
        <div style="background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2); box-shadow: inset 0 0 0 1px rgba(16, 185, 129, 0.1), 0 0 30px rgba(16, 185, 129, 0.05);" class="w-full rounded-3xl py-6 px-5 flex flex-col items-center justify-center gap-4">
          
          <!-- 1. テキスト（中央揃え） -->
          <div class="flex flex-col items-center select-none text-center">
            <div class="flex items-center justify-center gap-1.5">
              <span class="text-xs">🔒</span>
              <span class="text-[10px] font-black uppercase tracking-widest text-[#10b981]">MISSION COMPLETED</span>
            </div>
            <span class="text-xs font-bold text-white/80 mt-1">${p.completedAt ? `${formatCompletedAt(p.completedAt)}${p.staffName ? ` · ${p.staffName}` : ''}` : ''}</span>
          </div>
          
          ${syncLabelHtml ? `<div class="w-full flex justify-center mt-1">${syncLabelHtml.replace('ml-auto', '')}</div>` : ''}
        </div>
      `}

      ${p.isDone ? `
        ${gpsBadgeHtml}
        
        ${photoBlockHtml}

        <!-- 【配布数】上2つの証拠カードと枠サイズ・デザイン・青色テーマを完全統一 -->
        <div style="background: rgba(37, 99, 235, 0.05); border: 1.5px solid rgba(37, 99, 235, 0.4); box-shadow: inset 0 0 0 1px rgba(37, 99, 235, 0.15), 0 0 30px rgba(37, 99, 235, 0.05);" class="w-full rounded-2xl py-4 px-5 flex flex-col items-center justify-center">
          <div class="text-3xl font-black text-[#2563eb] text-center tracking-tight">
            配布数 ${p.count || 0}枚
          </div>
          ${!isLocked ? `
            <button onclick="openNumpad('${areaName}', ${p.rowId}, ${p.count || 0})" class="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white/80 active:scale-95 transition-all mt-2">枚数変更</button>
          ` : ''}
        </div>

        <!-- 4行目: この内容で提出する（閉じる）ボタン -->
        <button ontouchstart="" onclick="closeDetailModal()" style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); color: #10b981; box-shadow: inset 0 1px 0 rgba(255,255,255,0.1), inset 0 0 6px rgba(16,185,129,0.1), 0 0 12px rgba(16,185,129,0.05); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);" class="w-full h-12 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest rounded-2xl active:scale-95 active:translate-y-[2px] transition-all duration-75 mt-2">
          ✅ この内容で提出する（閉じる）
        </button>
      ` : ''}
    </div>
  `;
}

// Render the entire details list using global allPoints (1-line simple card)
function renderDetailList(areaName) {
  const cardsHtml = allPoints.map((p, i) => {
    const statusDot   = p.isDone 
      ? 'background-color: #2563eb; box-shadow: 0 0 10px rgba(37, 99, 235, 0.6);' 
      : 'background-color: rgba(255, 255, 255, 0.2);';
    const statusText  = p.isDone ? '🔒 完了' : '未完了';
    const statusColor = p.isDone ? 'color: #2563eb;' : 'color: rgba(255, 255, 255, 0.4);';

    // 同期バッジ (要件8: PENDING↓SYNCING↓COMPLETE / RETRYING...)
    const _s = p.syncStatus;
    const syncBadge = (() => {
      if (!_s) return '';
      if (_s === 'SYNCING'  || _s === 'sending') return ` <span style="color:#2563eb;font-size:7px;font-weight:900;letter-spacing:0.1em">●</span>`;
      if (_s === 'RETRY'    || _s === 'failed')  return ` <span style="color:#ef4444;font-size:7px;font-weight:900;letter-spacing:0.08em">RETRY</span>`;
      if (_s === 'PENDING'  || _s === 'pending') return ` <span style="color:#f59e0b;font-size:7px;font-weight:900;letter-spacing:0.08em">⋯</span>`;
      return '';
    })();

    // 3行目：配布員名（グリーンのバッジ枠で囲み、自然に中央揃えに）
    const nameLineHtml = p.isDone && p.staffName
      ? `
        <div class="w-full flex justify-center mt-0.5">
          <div style="background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.25); height: 22px; font-size: 10px; color: #10b981;" class="inline-flex items-center justify-center h-[22px] px-2.5 text-[10px] font-bold text-[#10b981] rounded-full tracking-wider">
            ${p.staffName}
          </div>
        </div>`
      : '';

    // 完了済みカードもタップでモーダルを開ける（写真・GPS確認などの利用ケースがあるため）
    const onclickAttr = `onclick="openPointDetailModal(${p.rowId})"`;
    const cardClass = "clickable-card premium-glass p-5 flex flex-col items-center justify-center gap-2 text-center";

    return `
      <div class="${cardClass}" ${onclickAttr}>
        <div class="w-full flex justify-center">
          <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); height: 26px; font-size: 12px; color: rgba(255, 255, 255, 0.9);" class="inline-flex items-center justify-center px-3 font-bold rounded-full tracking-wide truncate max-w-full">
            🏠 ${getCleanAddress(p.address)}
          </div>
        </div>
        <div style="${statusColor}" class="text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 w-full">
          <span style="${statusDot}" class="w-1.5 h-1.5 rounded-full inline-block"></span>
          <span>${statusText} ${p.isDone && p.count ? `· ${p.count}枚` : ''}${syncBadge}</span>
        </div>
        ${nameLineHtml}
      </div>`;
  }).join('');

  // 同一市区町村内の隣接エリアへの切り替えナビゲーションを追加
  const activeCity = currentCity || getCityName(areaName);
  const cityAreas = areaSummary ? areaSummary.filter(s => getCityName(s.name) === activeCity) : [];
  const currentIndex = cityAreas.findIndex(s => s.name === areaName);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex !== -1 && currentIndex < cityAreas.length - 1;

  const bottomNavHtml = `
    <div class="flex items-center justify-between mt-8 pb-10 w-full gap-4">
      <button onclick="navigateToSiblingArea(-1)" class="w-12 h-12 premium-glass-btn flex items-center justify-center text-xl font-bold ${hasPrev ? '' : 'opacity-20 pointer-events-none'}" ${hasPrev ? '' : 'disabled'}>‹</button>
      
      <button onclick="switchPage('areas')" class="flex-1 h-12 premium-glass-btn flex items-center justify-center text-xs font-bold uppercase tracking-wider text-white/80">一覧に戻る</button>
      
      <button onclick="navigateToSiblingArea(1)" class="w-12 h-12 premium-glass-btn flex items-center justify-center text-xl font-bold ${hasNext ? '' : 'opacity-20 pointer-events-none'}" ${hasNext ? '' : 'disabled'}>›</button>
    </div>
  `;

  $('detail-list').innerHTML = `<div class="space-y-4">${cardsHtml}</div>` + bottomNavHtml;
}

// 隣のエリアへの切り替えを実行する関数
function navigateToSiblingArea(direction) {
  if (!window.currentCityDetailAreaName || !areaSummary || areaSummary.length === 0) return;
  const activeCity = currentCity || getCityName(window.currentCityDetailAreaName);
  const cityAreas = areaSummary.filter(s => getCityName(s.name) === activeCity);
  const currentIndex = cityAreas.findIndex(s => s.name === window.currentCityDetailAreaName);
  if (currentIndex === -1) return;
  
  const targetIndex = currentIndex + direction;
  if (targetIndex >= 0 && targetIndex < cityAreas.length) {
    const targetAreaName = cityAreas[targetIndex].name;
    openDetail(targetAreaName);
  }
}

async function openDetail(name) {
  // ① 同一エリアへの再タップ: メモリキャッシュを使って即時描画（API スキップ）
  if (window.currentCityDetailAreaName === name && allPoints && allPoints.length > 0) {
    if (typeof scrollPositions !== 'undefined') scrollPositions['detail'] = 0;
    const contentEl = $('content');
    if (contentEl) contentEl.scrollTop = 0;
    renderDetailList(name); // 最新の allPoints（キュー同期済み）で再描画
    switchPage('detail');
    return; // API呼び出しなしで完了
  }

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
      
      // すでに詳細画面にいる状態での切り替え時にも、確実に先頭を表示させるためスクロールをトップにリセット
      const contentEl = $('content');
      if (contentEl) {
        contentEl.scrollTop = 0;
      }
      
      switchPage('detail');
    }
  } catch (e) {
    // alert()はLINE WebViewで不安定なためDOM表示に切り替え
    const detailList = $('detail-list');
    if (detailList) {
      detailList.innerHTML = `
        <div style="border: 1px solid rgba(255,255,255,0.04);" class="premium-glass p-8 flex flex-col items-center justify-center text-center gap-3 mt-8">
          <span class="text-2xl">⚠️</span>
          <p class="text-sm font-black text-white/60">データの取得に失敗しました</p>
          <p class="text-[10px] font-bold text-white/30 uppercase tracking-wider">時間をおいて再度お試しください</p>
        </div>`;
    }
    switchPage('detail');
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
        
        <div id="id-gyro-card" style="height: 300px; --glow-x: 0px; --glow-y: 0px; --glow-opacity: 0.08; --edge-opacity: 0.08; --edge-angle: 180deg;" class="w-full max-w-sm gyro-card flex flex-col items-center p-6 relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-b from-white/5 to-white/0 pointer-events-none rounded-[28px]"></div>
          
          <!-- 1. 最上部 (🟢AUTHを本当に少しだけ下へ微調整) -->
          <div style="margin-top: 18px;" class="inline-flex items-center gap-2 z-10">
            <span class="w-2 h-2 bg-[#22c55e] rounded-full shadow-[0_0_8px_#22c55e]"></span>
            <span class="text-[8px] font-black text-[#22c55e] uppercase tracking-[0.3em]">Authorized Staff</span>
          </div>
          
          <!-- 2. 中央アバターと名前 (絶対配置で縦横完全センター化、元のサイズをキープ) -->
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);" class="flex flex-col items-center z-10 w-full max-w-[280px]">
            ${avatarHtml}
            <div style="font-size: 28px; font-weight: 900; color: #ffffff; text-align: center; letter-spacing: 0.05em; line-height: 1.1;" class="flex flex-col items-center w-full">
              <div class="truncate w-full">${userInfo.last}</div>
              <div class="text-xs text-white/40 font-medium mt-1 truncate w-full">${userInfo.first || ''}</div>
            </div>
          </div>
          
          <!-- 3. 最下部 (底面から12px固定、上の2行をさらに1行分上にシフトしてバランス調整) -->
          <div style="position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%); width: 100%;" class="flex flex-col items-center gap-0.5 z-10">
            ${displayBranch ? `<p class="text-[8px] font-black text-white/40 uppercase tracking-[0.3em]">${displayBranch}</p>` : ''}
            <p class="text-[8px] font-black text-white/40 uppercase tracking-[0.3em]">Field Operations</p>
            <p style="margin-top: 12px;" class="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] select-none">
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
