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

  const activeClass   = 'flex-1 py-3 text-[10px] font-black tracking-widest rounded-xl bg-[#2563eb]/10 border border-[#2563eb]/30 text-[#2563eb] active:scale-[0.95] transition-all min-w-[70px]';
  const inactiveClass = 'flex-1 py-3 text-[10px] font-black tracking-widest rounded-xl bg-white/5 border border-white/10 text-white/40 active:scale-[0.95] transition-all min-w-[70px]';

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
async function loadDashboardData() {
  setApiStatus('connecting');

  try {
    // 3つのAPIを並行取得（全て個別にエラー保護）
    const [appData, rosterData, syncData] = await Promise.all([
      callApi('getAppData').catch(() => null),
      callApi('getRoster').catch(() => null),
      callApi('getDeliveryStats').catch(() => null)
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
  // スプラッシュをスキップして直接起動
  startAdmin();
});
