/**
 * POSTING MAP — 管理者アプリ ロジック
 *
 * admin/index.html 専用モジュール。
 * shared/api.js（callApi / callApiPost）を事前に読み込んでいることが前提。
 *
 * 担当機能:
 *   - ダッシュボードデータ取得・表示
 *   - Google Maps 動的ロード・描画
 *   - システムコマンド実行
 *   - タブ切り替え
 *   - ガラスモーダル制御
 *   - ローカルキャッシュ管理
 *   - ログコンソール出力
 */

const $ = id => document.getElementById(id);

// ── マップ関連変数 ───────────────────────────────────────────────
let googleMap = null;
let googleMapLoaded = false;
let mapCircles = [];
let mapInfoWindow = null;
let pendingMapAreas = null; // Maps SDK読み込み中の再呼び出し時にareasを保持

// ── Touch Active Handlers ────────────────────────────────────────
document.addEventListener('touchstart', e => {
  const el = e.target.closest('.btn-neu, .clickable-card');
  if (!el) return;
  if (el.classList.contains('btn-neu')) el.classList.add('pressed-primary');
  if (el.classList.contains('clickable-card')) el.classList.add('pressed-secondary');
}, { passive: true });
document.addEventListener('touchend', removePressed);
document.addEventListener('touchcancel', removePressed);
function removePressed() {
  document.querySelectorAll('.pressed-primary, .pressed-secondary').forEach(el =>
    el.classList.remove('pressed-primary', 'pressed-secondary')
  );
}

// ── ガラスモーダル制御 ────────────────────────────────────────────
function showModal({ title = '', body = '', actions = [] }) {
  $('admin-modal-title').textContent = title;
  $('admin-modal-body').textContent = body;
  const actionsEl = $('admin-modal-actions');
  actionsEl.innerHTML = '';
  actions.forEach(({ label, style, onClick }) => {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.className = style === 'danger'
      ? 'w-full py-4 rounded-2xl bg-rose-600 text-white font-black text-sm uppercase tracking-widest'
      : style === 'primary'
      ? 'w-full py-4 rounded-2xl bg-[#2563eb] text-white font-black text-sm uppercase tracking-widest'
      : 'w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-black text-sm uppercase tracking-widest';
    btn.onclick = () => { closeModal(); onClick && onClick(); };
    actionsEl.appendChild(btn);
  });
  const modal = $('admin-modal');
  const inner = $('admin-modal-inner');
  modal.classList.remove('opacity-0', 'pointer-events-none');
  requestAnimationFrame(() => inner.classList.remove('translate-y-full'));
}

function closeModal() {
  const modal = $('admin-modal');
  const inner = $('admin-modal-inner');
  inner.classList.add('translate-y-full');
  setTimeout(() => modal.classList.add('opacity-0', 'pointer-events-none'), 300);
}

// ── ログ出力 ──────────────────────────────────────────────────────
function addLog(msg) {
  const consoleEl = $('log-console');
  if (!consoleEl) return;
  const time = new Date().toLocaleTimeString('ja-JP', { hour12: false });
  const line = document.createElement('div');
  line.className = 'border-b border-white/[0.02] pb-1';
  line.innerHTML = `<span class="text-[#2563eb]">[${time}]</span> <span class="text-white/80">${msg}</span>`;
  consoleEl.appendChild(line);
  consoleEl.scrollTop = consoleEl.scrollHeight;
}

// ── タブ切り替えロジック ──────────────────────────────────────────
function switchAdminTab(tabName) {
  const panels = {
    monitor: $('panel-monitor'),
    areas:   $('panel-areas'),
    detail:  $('panel-detail'),
    system:  $('panel-system')
  };
  const btns = {
    monitor: $('tab-btn-monitor'),
    areas:   $('tab-btn-areas'),
    detail:  $('tab-btn-detail'),
    system:  $('tab-btn-system')
  };

  const activeClass   = 'nav-btn flex flex-col items-center gap-1 flex-1 transition-all text-[#2563eb]';
  const inactiveClass = 'nav-btn flex flex-col items-center gap-1 flex-1 transition-all text-white/40';

  Object.entries(panels).forEach(([name, panel]) => {
    if (!panel) return;
    if (name === tabName) {
      panel.classList.remove('hidden');
    } else {
      panel.classList.add('hidden');
    }
  });

  Object.entries(btns).forEach(([name, btn]) => {
    if (!btn) return;
    btn.className = name === tabName ? activeClass : inactiveClass;
  });
}

// ── ダッシュボードキャッシュの復元・保存 ───────────────────────────
function restoreDashboardCache() {
  try {
    const cached = localStorage.getItem('admin_dashboard_cache');
    if (!cached) return;
    const data = JSON.parse(cached);
    if ($('stat-coverage'))   $('stat-coverage').textContent = data.coverage;
    if ($('stat-progress-bar')) $('stat-progress-bar').style.width = data.coverage;
    if ($('stat-staff'))      $('stat-staff').textContent = data.staffCount;
    if ($('sync-stat-pending'))  $('sync-stat-pending').textContent  = data.syncPending   ?? '-';
    if ($('sync-stat-synced'))   $('sync-stat-synced').textContent   = data.syncWithGPS   ?? '-';
    if ($('sync-stat-photo'))    $('sync-stat-photo').textContent    = data.syncWithPhoto  ?? '-';
    if ($('sync-stat-lastsync')) $('sync-stat-lastsync').textContent = data.syncLastSyncAt ?? '-';
    addLog(`Cached stats restored (Last sync: ${data.syncLastSyncAt || 'N/A'})`);
  } catch (e) {
    console.error('Failed to restore cache:', e);
  }
}

function saveDashboardCache({ coverage, staffCount, syncData }) {
  try {
    const cacheData = {
      coverage,
      staffCount,
      syncPending:    syncData ? syncData.pending    : '-',
      syncWithGPS:    syncData ? syncData.withGPS    : '-',
      syncWithPhoto:  syncData ? syncData.withPhoto  : '-',
      syncLastSyncAt: syncData ? syncData.lastSyncAt : '-',
      timestamp: Date.now()
    };
    localStorage.setItem('admin_dashboard_cache', JSON.stringify(cacheData));
  } catch (e) {
    console.error('Failed to save cache:', e);
  }
}

// ── API 状態表示 ──────────────────────────────────────────────────
function setApiStatus(state) {
  const dot  = $('api-dot');
  const text = $('api-status-text');
  if (!dot || !text) return;

  if (state === 'connecting') {
    dot.className  = 'w-2 h-2 bg-yellow-500 rounded-full animate-pulse shadow-[0_0_8px_#eab308]';
    text.textContent = 'CONNECTING...';
    text.className   = 'text-xs font-black text-yellow-500 tracking-tighter uppercase';
  } else if (state === 'connected') {
    dot.className  = 'w-2 h-2 bg-[#10b981] rounded-full shadow-[0_0_8px_#10b981]';
    text.textContent = 'CONNECTED';
    text.className   = 'text-xs font-black text-[#10b981] tracking-tighter uppercase';
  } else {
    dot.className  = 'w-2 h-2 bg-rose-500 rounded-full';
    text.textContent = 'API ERROR';
    text.className   = 'text-xs font-black text-rose-500 tracking-tighter uppercase';
  }
}

// ── ダッシュボードデータ読み込み ─────────────────────────────────
// ── ダッシュボードデータ読み込み ─────────────────────────────────
async function loadDashboardData() {
  setApiStatus('connecting');

  try {
    // 5つのAPIを並行取得（全て個別にエラー保護）
    const [appData, rosterData, syncData, stockData, requestData] = await Promise.all([
      callApi('getAppData').catch(() => null),
      callApi('getRoster').catch(() => null),
      callApi('getDeliveryStats').catch(() => null),
      callApi('getFlyerStock').catch(() => null),
      callApi('getTransferRequests').catch(() => null)
    ]);

    let coverageText = '0%';
    let staffCount   = 0;

    // ── 全体配布率 ──
    if (appData && appData.success) {
      const areas = appData.areas || [];
      let totalDone = 0, totalPoints = 0;
      areas.forEach(area => { totalDone += area.done || 0; totalPoints += area.total || 0; });
      const coverage = totalPoints > 0 ? Math.round((totalDone / totalPoints) * 100) : 0;
      coverageText = `${coverage}%`;

      if ($('stat-coverage'))     $('stat-coverage').textContent    = coverageText;
      if ($('stat-progress-bar')) $('stat-progress-bar').style.width = coverageText;
      addLog(`Stats updated: coverage ${coverageText} (${totalDone}/${totalPoints} across ${areas.length} districts)`);

      // 全体戦略マップ
      if (appData.apiKey) {
        loadGoogleMaps(appData.apiKey, areas);
      } else {
        const mapLoader = $('map-loading');
        if (mapLoader) mapLoader.innerHTML = '<p class="text-[9px] font-black text-rose-500 uppercase tracking-[0.2em]">APIキーが未設定です</p>';
      }
    } else {
      addLog('Warning: getAppData failed or returned no data.');
    }

    // ── 稼働配布員 ──
    if (rosterData && rosterData.success) {
      const rosterList = rosterData.roster || [];
      staffCount = rosterList.length;
      if ($('stat-staff')) $('stat-staff').textContent = staffCount;
      addLog(`Roster loaded: ${staffCount} distributor(s) registered.`);
    } else {
      addLog('Warning: getRoster failed or returned no data.');
    }

    // ── 同期状況 ──
    if (syncData && syncData.success) {
      if ($('sync-stat-pending'))  $('sync-stat-pending').textContent  = syncData.pending   ?? '-';
      if ($('sync-stat-synced'))   $('sync-stat-synced').textContent   = syncData.withGPS   ?? '-';
      if ($('sync-stat-photo'))    $('sync-stat-photo').textContent    = syncData.withPhoto  ?? '-';
      if ($('sync-stat-lastsync')) $('sync-stat-lastsync').textContent = syncData.lastSyncAt || '-';
      addLog(`Sync stats: completed=${syncData.totalCompleted}, gps=${syncData.withGPS}, photo=${syncData.withPhoto}`);
    } else {
      addLog('Warning: getDeliveryStats failed or returned no data.');
    }

    // ── チラシ保管状況 ──
    if (stockData && stockData.success) {
      renderFlyerStock(stockData.stocks || []);
      addLog('Flyer inventory loaded.');
    } else {
      addLog('Warning: getFlyerStock failed.');
    }

    // ── 受渡要請 ──
    if (requestData && requestData.success) {
      renderTransferRequests(requestData.requests || []);
      addLog('Transfer requests loaded.');
    } else {
      addLog('Warning: getTransferRequests failed.');
    }

    saveDashboardCache({ coverage: coverageText, staffCount, syncData: syncData?.success ? syncData : null });
    setApiStatus('connected');

  } catch (e) {
    addLog(`Dashboard sync failed: ${e.message}`);
    setApiStatus('error');
  }
}

// ── Google Maps 動的ロード ───────────────────────────────────────
function loadGoogleMaps(apiKey, areas) {
  // 最新のareasを常に保持（ロード中の再呼び出しに対応）
  pendingMapAreas = areas;

  if (googleMapLoaded) {
    drawMap(areas);
    return;
  }

  if (window.googleMapsLoading) {
    // ロード中 → pendingMapAreasを更新しておくだけ（callback内でdrawMapされる）
    return;
  }

  window.googleMapsLoading = true;

  window.initAdminMapCallback = function () {
    googleMapLoaded = true;
    window.googleMapsLoading = false;
    // ロード完了後に最新のareasでdrawMap
    if (pendingMapAreas) drawMap(pendingMapAreas);
  };

  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initAdminMapCallback&language=ja`;
  script.async = true;
  script.defer = true;
  script.onerror = function () {
    const loader = $('map-loading');
    if (loader) loader.innerHTML = '<p class="text-[9px] font-black text-rose-500 uppercase tracking-[0.2em]">地図のロードに失敗しました</p>';
  };
  document.head.appendChild(script);
}

// ── 全体戦略マップ描画 ───────────────────────────────────────────
function drawMap(areas) {
  if (!window.google || !window.google.maps) return;

  const mapContainer = $('map');
  if (!mapContainer) return;

  if (!googleMap) {
    const darkStyle = [
      { elementType: 'geometry', stylers: [{ color: '#111111' }] },
      { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#111111' }] },
      { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#555555' }] },
      { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#000000' }] },
      { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#222222' }] },
      { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#666666' }] },
      { featureType: 'poi', stylers: [{ visibility: 'off' }] }
    ];
    googleMap = new google.maps.Map(mapContainer, {
      center: { lat: 34.862, lng: 136.538 },
      zoom: 10,
      styles: darkStyle,
      disableDefaultUI: true,
      zoomControl: true
    });
    mapInfoWindow = new google.maps.InfoWindow();
  }

  mapCircles.forEach(c => c.setMap(null));
  mapCircles = [];

  let validCoordsCount = 0;
  const bounds = new google.maps.LatLngBounds();

  areas.forEach(area => {
    if (!area.lat || !area.lng) return;

    const pos = { lat: parseFloat(area.lat), lng: parseFloat(area.lng) };
    bounds.extend(pos);
    validCoordsCount++;

    const progress = area.progress ?? 0;
    const color = progress >= 80 ? '#22c55e' : progress >= 30 ? '#eab308' : '#f43f5e';

    const circle = new google.maps.Circle({
      strokeColor: '#ffffff',
      strokeOpacity: 0.8,
      strokeWeight: 1.5,
      fillColor: color,
      fillOpacity: 0.3,
      map: googleMap,
      center: pos,
      radius: 300
    });

    circle.addListener('click', () => {
      const content = `
        <div style="color:#000;font-family:sans-serif;padding:8px;font-size:11px;line-height:1.4;">
          <div style="font-weight:900;font-size:12px;margin-bottom:4px;">🏢 ${area.name}</div>
          <div>進捗率: <span style="color:#2563eb;font-weight:bold;">${progress}%</span></div>
          <div style="margin-bottom:8px;">配布完了数: ${area.done} / ${area.total}</div>
          <button onclick="window.openAreaDetail('${area.name}')" style="background:#2563eb;color:#fff;border:none;border-radius:6px;padding:6px 12px;font-weight:bold;cursor:pointer;width:100%;display:block;">詳細を開く</button>
        </div>
      `;
      mapInfoWindow.setContent(content);
      mapInfoWindow.setPosition(pos);
      mapInfoWindow.open(googleMap);
    });

    mapCircles.push(circle);
  });

  if (validCoordsCount > 0) {
    googleMap.fitBounds(bounds);
    const listener = google.maps.event.addListener(googleMap, 'idle', () => {
      if (googleMap.getZoom() > 11) googleMap.setZoom(11);
      google.maps.event.removeListener(listener);
    });
  }

  const loader = $('map-loading');
  if (loader) {
    loader.classList.add('opacity-0');
    setTimeout(() => loader.style.display = 'none', 500);
  }
}

// ── コマンド実行 ──────────────────────────────────────────────────
async function runCommand(action) {
  if (action === 'resetAllSheets') {
    showModal({
      title: '⚠️ System Reset — 最終確認',
      body: 'すべての地区シートを削除し、システムを完全初期化します。\nこの操作は取り消せません。',
      actions: [
        { label: 'System Reset を実行', style: 'danger', onClick: () => _executeCommand(action) },
        { label: 'キャンセル', style: 'cancel' }
      ]
    });
    return;
  }
  await _executeCommand(action);
}

async function _executeCommand(action) {
  $('loading').classList.remove('hidden');
  addLog(`Initiated command: ${action}`);
  try {
    const res = await callApiPost(action);
    if (res && res.success) {
      addLog(`Success: ${res.message || 'Operation completed.'}`);
      showModal({
        title: '✅ Command Complete',
        body: res.message || 'コマンドが正常に実行されました。',
        actions: [{ label: '閉じる', style: 'primary' }]
      });
      loadDashboardData();
    } else {
      throw new Error(res ? res.message : 'API response failed');
    }
  } catch (err) {
    addLog(`Error: ${err.message}`);
    showModal({
      title: '❌ Command Failed',
      body: err.message,
      actions: [{ label: '閉じる', style: 'cancel' }]
    });
  } finally {
    $('loading').classList.add('hidden');
  }
}

// ── 未実装ページモーダル ──────────────────────────────────────────
function showPendingPageModal(pageNum) {
  const pageNames = { 2: '地区一覧 (ページ2)', 3: '配布詳細 (ページ3)' };
  showModal({
    title: `🏢 ${pageNames[pageNum]}`,
    body: `${pageNames[pageNum]} への遷移機能は、将来の開発フェーズで実装されます。`,
    actions: [{ label: '閉じる', style: 'primary' }]
  });
}

window.openAreaDetail = function (areaName) {
  showModal({
    title: '🏢 エリア詳細',
    body: `「${areaName}」のエリア詳細画面（ページ2・3）へ遷移する機能は、将来のフェーズで実装されます。`,
    actions: [{ label: '閉じる', style: 'primary' }]
  });
};

// ── 起動 ──────────────────────────────────────────────────────────
function startAdmin() {
  // 1. キャッシュから即座に画面を描画（ゼロ待ち表示）
  restoreDashboardCache();

  // 2. スプラッシュからアプリ画面へ切り替え
  $('screen-gateway').classList.add('hidden');
  $('app').classList.remove('hidden');
  setTimeout(() => $('app').classList.remove('opacity-0'), 50);

  // 3. バックグラウンドでAPIから最新データを非同期取得
  loadDashboardData();
}

window.addEventListener('load', () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('../service-worker.js')
      .then(reg => console.log('SW registered. Scope:', reg.scope))
      .catch(err => console.error('SW registration failed:', err));
  }

  // アプリを即時起動（LIFFを待たない）
  startAdmin();

  // LIFFは完全バックグラウンドで管理者ID登録（アプリ起動を妨げない）
  const LIFF_ID = '2010177345-5y5ayk0h';
  const tryRegisterAdmin = () => {
    if (typeof liff === 'undefined') return; // LIFF SDK未ロードならスキップ
    liff.init({ liffId: LIFF_ID })
      .then(() => {
        if (!liff.isLoggedIn()) return null; // 未ログインはリダイレクトしない
        return liff.getProfile();
      })
      .then(profile => {
        if (!profile) return;
        return callApiPost('registerAdmin', {
          displayName: profile.displayName,
          lineUserId: profile.userId
        });
      })
      .then(res => {
        if (res && res.success) {
          addLog(`Admin ID登録: ${res.message === 'new' ? '新規' : '既登録'}`);
        }
      })
      .catch(e => console.warn('LIFF admin registration:', e));
  };
  // LIFF SDKが非同期ロードのため少し遅らせて実行
  setTimeout(tryRegisterAdmin, 1500);
});

// 保管状況一覧（FLYER STOCK INVENTORY）の描画
function renderFlyerStock(stocks) {
  const container = $('manager-storage-list-container');
  if (!container) return;

  if (!stocks || stocks.length === 0) {
    container.innerHTML = `
      <div style="border: 1px solid rgba(255,255,255,0.04);" class="premium-glass p-8 flex flex-col items-center justify-center text-center gap-3">
        <span class="text-2xl">📦</span>
        <p class="text-sm font-black text-white/60">現在、保管されているチラシはありません</p>
      </div>`;
    return;
  }

  // テストデータ除外
  stocks = stocks.filter(s => {
    const name = s.staffName || '';
    const id = s.staffId || '';
    return !name.includes('テスト') && !id.toUpperCase().includes('TEST');
  });

  // 保管場所ごとにグループ化
  const groups = {};
  stocks.forEach(s => {
    const loc = s.location || 'その他';
    if (!groups[loc]) groups[loc] = [];
    groups[loc].push(s);
  });

  const sortedLocations = Object.keys(groups).sort();

  const groupsHtml = sortedLocations.map(loc => {
    const list = groups[loc];
    const staffCount = list.length;

    const rowsHtml = list.map(s => `
      <div class="flex justify-between items-center py-4 border-b border-white/5 last:border-b-0 px-2 -mx-2">
        <div class="min-w-0 flex-1">
          <div class="text-sm font-black text-white">${(s.staffName||'').replace(/&/g,'&amp;').replace(/</g,'&lt;')}</div>
          <div class="text-[9px] text-white/40 font-mono mt-0.5">${(s.staffId||'').replace(/&/g,'&amp;').replace(/</g,'&lt;')} · ${(s.updatedAt||'---').replace(/&/g,'&amp;').replace(/</g,'&lt;')}</div>
        </div>
        <div class="flex items-center gap-3 shrink-0">
          <span class="text-base font-black text-[#22c55e] font-mono">${(s.count || 0).toLocaleString()}枚</span>
        </div>
      </div>`).join('');

    return `
      <div class="premium-glass p-6 space-y-1">
        <div class="flex justify-between items-center border-b border-white/10 pb-3 mb-2">
          <span class="text-xs font-black text-white tracking-wider">${loc}</span>
          <span style="background: rgba(37,99,235,0.1); color: #2563eb;" class="text-[10px] font-black px-2 py-0.5 rounded-full font-mono">${staffCount}名保管</span>
        </div>
        <div>${rowsHtml}</div>
      </div>`;
  }).join('');

  container.innerHTML = groupsHtml;
}

// 受渡要請一覧の描画
function renderTransferRequests(requests) {
  const container = $('manager-transfer-list-container');
  if (!container) return;

  // 申請中の要請のみ表示
  const activeRequests = requests.filter(r => r.status === '申請中');

  if (activeRequests.length === 0) {
    container.innerHTML = `
      <div style="border: 1px solid rgba(255,255,255,0.04);" class="premium-glass p-8 flex flex-col items-center justify-center text-center gap-3">
        <p class="text-sm font-black text-white/40">現在、処理待ちの要請はありません</p>
      </div>`;
    return;
  }

  const itemsHtml = activeRequests.map(r => {
    return `
      <div class="premium-glass p-6 space-y-4" data-row="${r.rowNumber}">
        <div class="flex justify-between items-start border-b border-white/10 pb-3">
          <div>
            <div class="text-[10px] font-black text-white/40 font-mono">${r.requestTime}</div>
            <div class="text-sm font-black text-white mt-1">
              要請者: ${r.requesterName}
            </div>
          </div>
          <span style="background: rgba(245,158,11,0.1); color: #f59e0b;" class="text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            ${r.status}
          </span>
        </div>

        <div class="space-y-2 text-xs">
          <div class="flex justify-between">
            <span class="text-white/60">希望地区:</span>
            <span class="font-black text-white">${r.areaName}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-white/60">希望枚数:</span>
            <span class="font-black text-[#22c55e] font-mono">${(r.count).toLocaleString()}枚</span>
          </div>
          <div class="flex justify-between">
            <span class="text-white/60">保管者 (希望):</span>
            <span class="font-black text-white">${r.holderName || '-'}</span>
          </div>
        </div>

        <div class="flex gap-3 pt-2">
          <button onclick="contactHolder('${r.holderName}', '${r.holderId}', '${r.requesterName}', '${r.areaName}', ${r.count})" 
            style="background: rgba(37,99,235,0.1); border-color: rgba(37,99,235,0.3); color: #2563eb;" 
            class="flex-1 py-3 text-xs font-black rounded-xl border active:scale-[0.97] transition-all flex items-center justify-center gap-1.5">
            💬 保管者に連絡
          </button>
          <button onclick="resolveRequest(${r.rowNumber})" 
            style="background: #2563eb;" 
            class="flex-1 py-3 text-xs font-black text-white rounded-xl active:scale-[0.97] transition-all flex items-center justify-center gap-1.5">
            ✅ 完了にする
          </button>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = itemsHtml;
}

// 保管者にLINE連絡する共有リンクを起動する
window.contactHolder = function(holderName, holderId, requesterName, areaName, count) {
  if (!holderName || holderName === '-') {
    alert('保管者が指定されていません。保管状況一覧から余剰在庫を持つ方をご確認ください。');
    return;
  }
  const text = `【チラシ受渡依頼】\n${holderName}さん、配布員の${requesterName}さんが、${holderName}さんの保管するチラシ${Number(count).toLocaleString()}枚（${areaName}）の受渡を希望しています。\nお手数ですが、${requesterName}さんへ直接ご連絡の上、受け渡しをお願いいたします。\n■ 連絡先 (${requesterName}さん): LINEトーク等で直接ご連絡ください。`;
  const lineUrl = `https://line.me/R/share?text=${encodeURIComponent(text)}`;
  window.open(lineUrl, '_blank');
};

// 要請を完了にする
window.resolveRequest = async function(rowNumber) {
  if (!confirm('この要請を完了にしますか？')) return;
  try {
    const res = await callApiPost('resolveTransferRequest', {
      rowNumber: rowNumber,
      status: '完了'
    });
    if (res && res.success) {
      addLog(`Request row ${rowNumber} resolved to completed.`);
      loadDashboardData(); // リロードして最新化
    } else {
      alert('完了処理に失敗しました: ' + (res ? res.message : 'Unknown error'));
    }
  } catch(e) {
    alert('通信エラー: ' + e.message);
  }
};

