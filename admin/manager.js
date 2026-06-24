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
    monitor:  $('panel-monitor'),
    storage:  $('panel-storage'),
    report:   $('panel-report'),
    transfer: $('panel-transfer'),
    roster:   $('panel-roster'),
    system:   $('panel-system')
  };
  const btns = {
    monitor:  $('tab-btn-monitor'),
    storage:  $('tab-btn-storage'),
    report:   $('tab-btn-report'),
    transfer: $('tab-btn-transfer'),
    roster:   $('tab-btn-roster'),
    system:   $('tab-btn-system')
  };

  const activeClass   = 'nav-btn flex flex-col items-center gap-1 flex-1 transition-all text-white';
  const inactiveClass = 'nav-btn flex flex-col items-center gap-1 flex-1 transition-all text-white/40 opacity-40';

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
    const span = btn.querySelector('span');
    if (span) {
      if (name === tabName) {
        span.className = 'text-[10px] font-black uppercase tracking-widest text-white';
      } else {
        span.className = 'text-[10px] font-black uppercase tracking-widest text-white/40';
      }
    }
  });

  // タブに応じたデータロード
  if (tabName === 'storage') {
    loadFlyerStock();
  } else if (tabName === 'report') {
    loadRanking();
    if ($('report-coverage') && $('stat-coverage')) {
      $('report-coverage').textContent = $('stat-coverage').textContent;
      $('report-progress-bar').style.width = $('stat-progress-bar').style.width;
    }
  } else if (tabName === 'transfer') {
    loadTransferRequests();
  } else if (tabName === 'roster') {
    loadRoster();
  }
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
    addLog(`キャッシュ統計を復元しました（最終同期: ${data.syncLastSyncAt || '非同期'}）`);
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
    dot.className  = 'w-2 h-2 bg-[#22c55e] rounded-full shadow-[0_0_8px_#22c55e]';
    text.textContent = 'CONNECTED';
    text.className   = 'text-xs font-black text-[#22c55e] tracking-tighter uppercase';
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
      addLog(`統計情報を更新しました：配布率 ${coverageText}（完了数: ${totalDone}/${totalPoints}、地区数: ${areas.length}）`);

      // 全体戦略マップ
      if (appData.apiKey) {
        loadGoogleMaps(appData.apiKey, areas);
      } else {
        const mapLoader = $('map-loading');
        if (mapLoader) mapLoader.innerHTML = '<p class="text-[9px] font-black text-rose-500 uppercase tracking-[0.2em]">APIキーが未設定です</p>';
      }
    } else {
      addLog('警告: エリアデータの取得に失敗したか、データが空です。');
    }

    // ── 稼働配布員 ──
    if (rosterData && rosterData.success) {
      const rosterList = rosterData.roster || [];
      staffCount = rosterList.length;
      if ($('stat-staff')) $('stat-staff').textContent = staffCount;
      addLog(`名簿を読み込みました：${staffCount}名の配布員が登録されています。`);
    } else {
      addLog('警告: 配布員名簿の取得に失敗したか、データが空です。');
    }

    // ── 同期状況 ──
    if (syncData && syncData.success) {
      if ($('sync-stat-pending'))  $('sync-stat-pending').textContent  = syncData.pending   ?? '-';
      if ($('sync-stat-synced'))   $('sync-stat-synced').textContent   = syncData.withGPS   ?? '-';
      if ($('sync-stat-photo'))    $('sync-stat-photo').textContent    = syncData.withPhoto  ?? '-';
      if ($('sync-stat-lastsync')) $('sync-stat-lastsync').textContent = syncData.lastSyncAt || '-';
      addLog(`同期状況：完了数=${syncData.totalCompleted}、GPS記録=${syncData.withGPS}、写真保存=${syncData.withPhoto}`);
    } else {
      addLog('警告: 配布統計の取得に失敗したか、データが空です。');
    }

    saveDashboardCache({ coverage: coverageText, staffCount, syncData: syncData?.success ? syncData : null });
    setApiStatus('connected');

  } catch (e) {
    addLog(`ダッシュボードの同期に失敗しました: ${e.message}`);
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
          <button onclick="window.dispatchLineRequest('${area.name}')" style="background:#2563eb;color:#fff;border:none;border-radius:6px;padding:6px 12px;font-weight:bold;cursor:pointer;width:100%;display:block;margin-bottom:6px;">💬 配布を打診</button>
          <button onclick="window.openAreaDetail('${area.name}')" style="background:#e4e4e7;color:#18181b;border:none;border-radius:6px;padding:6px 12px;font-weight:bold;cursor:pointer;width:100%;display:block;">詳細を開く</button>
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
  addLog(`コマンド実行を開始: ${action}`);
  try {
    const res = await callApiPost(action);
    if (res && res.success) {
      addLog(`実行成功: ${res.message || '処理が完了しました。'}`);
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
    addLog(`エラー: ${err.message}`);
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

  return; // Phase 1 Wireframe Guard

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
  const LIFF_ID = '2010374196-nqrj70WC';
  const tryRegisterAdmin = () => {
    return; // Phase 1 Wireframe Guard
    if (typeof liff === 'undefined') return; // LIFF SDK未ロードならスキップ
    liff.init({ liffId: LIFF_ID })
      .then(() => {
        if (!liff.isLoggedIn()) return null; // 未ログインはリダイレクトしない
        return liff.getProfile();
      })
      .then(profile => {
        if (!profile) return;
        window.adminProfile = profile; // 管理者のプロフィールをグローバル保持
        return callApiPost('registerAdmin', {
          displayName: profile.displayName,
          lineUserId: profile.userId
        });
      })
      .then(res => {
        if (res && res.success) {
          addLog(`管理者ID登録: ${res.message === 'new' ? '新規' : '既登録'}`);
        }
      })
      .catch(e => console.warn('LIFF admin registration:', e));
  };
  // LIFF SDKが非同期ロードのため少し遅らせて実行
  setTimeout(tryRegisterAdmin, 1500);
});

// ── 2層ナビゲーション制御 ───────────────────────────────────────
window.toggleNavTier = function(tier) {
  if (tier === 2) {
    $('nav-tier-1').classList.add('hidden');
    $('nav-tier-2').classList.remove('hidden');
  } else {
    $('nav-tier-2').classList.add('hidden');
    $('nav-tier-1').classList.remove('hidden');
  }
};

// ── 📦 チラシ保管状況 (Flyer Stock) ロード・描画 ────────────────────
async function loadFlyerStock() {
  const container = $('manager-storage-list-container');
  if (!container) return;
  try {
    const data = await callApi('getFlyerStock');
    if (data && data.success && Array.isArray(data.stocks)) {
      const stocks = data.stocks;
      if (stocks.length === 0) {
        container.innerHTML = `
          <div class="premium-glass p-8 flex flex-col items-center justify-center text-center gap-3">
            <span class="text-2xl">📦</span>
            <p class="text-sm font-black text-white/60">現在、保管されているチラシはありません</p>
          </div>`;
        return;
      }

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
          <div class="stock-row flex justify-between items-center py-4 border-b border-white/5 last:border-b-0 active:bg-white/5 transition-colors rounded-xl px-2 -mx-2 cursor-pointer"
            data-name="${(s.staffName||'').replace(/"/g,'&quot;')}"
            data-id="${(s.staffId||'').replace(/"/g,'&quot;')}"
            data-loc="${(s.location||'').replace(/"/g,'&quot;')}"
            data-count="${s.count||0}">
            <div class="min-w-0 flex-1">
              <div class="text-sm font-black text-white">${(s.staffName||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>
              <div class="text-[9px] text-white/40 font-mono mt-0.5">${(s.staffId||'').replace(/&/g,'&amp;').replace(/</g,'&lt;')} · ${(s.updatedAt||'---').replace(/&/g,'&amp;').replace(/</g,'&lt;')}</div>
            </div>
            <div class="flex items-center gap-3 shrink-0">
              <span class="text-base font-black text-[#22c55e] font-mono">${(s.count || 0).toLocaleString()}枚</span>
              <span class="text-[10px] font-black text-[#2563eb]">💬</span>
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

      container.querySelectorAll('.stock-row').forEach(row => {
        row.addEventListener('click', () => {
          sendLineContact(
            row.dataset.name,
            row.dataset.id,
            row.dataset.loc,
            parseFloat(row.dataset.count) || 0
          );
        });
      });
    }
  } catch(e) {
    console.error("loadFlyerStock Error:", e);
    container.innerHTML = `
      <div class="premium-glass p-8 flex flex-col items-center justify-center text-center gap-3">
        <span class="text-2xl">⚠️</span>
        <p class="text-sm font-black text-rose-500">保管状況の取得に失敗しました</p>
      </div>`;
  }
}

function sendLineContact(staffName, staffId, location, count) {
  const text = `【チラシ受渡のお願い】\n${staffName}さんの保管チラシ（${location} ${Number(count).toLocaleString()}枚）を一部分けていただけないでしょうか？`;
  const lineUrl = `https://line.me/R/share?text=${encodeURIComponent(text)}`;
  window.open(lineUrl, '_blank');
}

// ── 📦 管理者用在庫登録 ─────────────────────────────────────────
window.submitFlyerStock = async function() {
  const locSelect = $('storage-register-location');
  const countInput = $('storage-register-count');
  const msgEl = $('storage-register-message');
  const btn = $('btn-storage-register-submit');
  
  if (!locSelect || !countInput || !msgEl || !btn) return;
  
  const location = locSelect.value;
  const count = parseInt(countInput.value, 10);
  
  if (!location) {
    alert("保管場所を選択してください。");
    return;
  }
  if (isNaN(count) || count <= 0) {
    alert("正しい枚数を入力してください。");
    return;
  }
  
  const staffName = window.adminProfile ? window.adminProfile.displayName : "管理者本部";
  const staffId = window.adminProfile ? window.adminProfile.userId.slice(-6) : "ADMIN";
  
  btn.disabled = true;
  btn.textContent = "登録中...";
  msgEl.classList.add('hidden');
  
  try {
    const res = await callApiPost('updateFlyerStock', {
      location: location,
      count: count,
      staffName: staffName,
      staffId: staffId
    });
    
    if (res && res.success) {
      msgEl.textContent = "✓ 在庫を登録しました";
      msgEl.classList.remove('hidden');
      countInput.value = '';
      loadFlyerStock();
    } else {
      alert("登録に失敗しました: " + (res.message || "エラー"));
    }
  } catch (e) {
    alert("エラーが発生しました: " + e.message);
  } finally {
    btn.disabled = false;
    btn.textContent = "在庫を登録する";
  }
};

// ── 🚚 チラシ流通 (Transfer Requests) ロード・描画 ──────────────────
async function loadTransferRequests() {
  const container = $('manager-transfer-list-container');
  if (!container) return;
  try {
    const data = await callApi('getTransferRequests');
    if (data && Array.isArray(data)) {
      const activeRequests = data.filter(r => r.status === '申請中');

      if (activeRequests.length === 0) {
        container.innerHTML = `
          <div class="premium-glass p-8 flex flex-col items-center justify-center text-center gap-3">
            <p class="text-sm font-black text-white/40">現在、処理待ちの要請はありません</p>
          </div>`;
        return;
      }

      const itemsHtml = activeRequests.map(r => `
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
            <button onclick="window.contactHolder('${r.holderName}', '${r.holderId}', '${r.requesterName}', '${r.areaName}', ${r.count})" 
              style="background: rgba(37,99,235,0.1); border-color: rgba(37,99,235,0.3); color: #2563eb;" 
              class="flex-1 py-3 text-xs font-black rounded-xl border active:scale-[0.97] transition-all flex items-center justify-center gap-1.5">
              💬 保管者に連絡
            </button>
            <button onclick="window.resolveRequest(${r.rowNumber})" 
              style="background: #2563eb;" 
              class="flex-1 py-3 text-xs font-black text-white rounded-xl active:scale-[0.97] transition-all flex items-center justify-center gap-1.5">
              ✅ 完了にする
            </button>
          </div>
        </div>
      `).join('');

      container.innerHTML = itemsHtml;
    }
  } catch(e) {
    console.error("loadTransferRequests Error:", e);
    container.innerHTML = `
      <div class="premium-glass p-8 flex flex-col items-center justify-center text-center gap-3">
        <span class="text-2xl">⚠️</span>
        <p class="text-sm font-black text-rose-500">受渡要請の取得に失敗しました</p>
      </div>`;
  }
}

window.contactHolder = function(holderName, holderId, requesterName, areaName, count) {
  if (!holderName || holderName === '-') {
    alert('保管者が指定されていません。保管状況一覧から余剰在庫を持つ方をご確認ください。');
    return;
  }
  const text = `【チラシ受渡依頼】\n${holderName}さん、配布員の${requesterName}さんが、${holderName}さんの保管するチラシ${Number(count).toLocaleString()}枚（${areaName}）の受渡を希望しています。\nお手数ですが、${requesterName}さんへ直接ご連絡の上、受け渡しをお願いいたします。\n■ 連絡先 (${requesterName}さん): LINEトーク等で直接ご連絡ください。`;
  const lineUrl = `https://line.me/R/share?text=${encodeURIComponent(text)}`;
  window.open(lineUrl, '_blank');
};

window.resolveRequest = async function(rowNumber) {
  if (!confirm('この要請を完了にしますか？')) return;
  try {
    const res = await callApiPost('resolveTransferRequest', {
      rowNumber: rowNumber,
      status: '完了'
    });
    if (res && res.success) {
      addLog(`受渡要請（行番号: ${rowNumber}）のステータスを「完了」に更新しました。`);
      loadTransferRequests();
    } else {
      alert('完了処理に失敗しました: ' + (res ? res.message : 'Unknown error'));
    }
  } catch(e) {
    alert('通信エラー: ' + e.message);
  }
};

// ── 🏆 配布員ランキング (Leaderboard) ロード・描画 ──────────────────
async function loadRanking() {
  const container = $('ranking-list');
  if (!container) return;
  try {
    const data = await callApi('getRanking');
    if (data && data.success && Array.isArray(data.ranking)) {
      const list = data.ranking;
      if (list.length === 0) {
        container.innerHTML = `
          <div class="premium-glass p-8 flex flex-col items-center justify-center text-center gap-3">
            <span class="text-2xl">🏆</span>
            <p class="text-sm font-black text-white/60">現在、ランキングデータはありません</p>
          </div>`;
        return;
      }

      const itemsHtml = list.map((item, index) => {
        const rank = index + 1;
        const name = item.name || "不明";
        const count = item.count || 0;
        let rankBadgeClass = "bg-white/5 border-white/10 text-white/60";
        let glowDot = "";

        if (rank === 1) {
          rankBadgeClass = "bg-[#d4af37]/10 border-[#d4af37]/30 text-[#d4af37]";
          glowDot = `<span style="position: absolute; left: 10px;" class="w-1.5 h-1.5 bg-[#d4af37] rounded-full animate-soft-pulse shadow-[0_0_6px_#d4af37]"></span>`;
        } else if (rank === 2) {
          rankBadgeClass = "bg-[#c0c0c0]/10 border-[#c0c0c0]/30 text-[#c0c0c0]";
          glowDot = `<span style="position: absolute; left: 10px;" class="w-1.5 h-1.5 bg-[#c0c0c0] rounded-full shadow-[0_0_4px_#c0c0c0]"></span>`;
        } else if (rank === 3) {
          rankBadgeClass = "bg-[#cd7f32]/10 border-[#cd7f32]/30 text-[#cd7f32]";
          glowDot = `<span style="position: absolute; left: 10px;" class="w-1.5 h-1.5 bg-[#cd7f32] rounded-full shadow-[0_0_4px_#cd7f32]"></span>`;
        }

        return `
          <div class="premium-glass p-5 flex flex-col items-center justify-center text-center gap-1.5 relative">
            <div style="min-width: 76px; position: relative;" class="inline-flex items-center justify-center h-6 rounded-full border text-[10px] font-black uppercase tracking-wider px-3 ${rankBadgeClass}">
              ${glowDot}
              <span>${rank}位</span>
            </div>
            <div class="text-sm font-black text-white mt-1">${(name).replace(/&/g,'&amp;').replace(/</g,'&lt;')}</div>
            <div class="text-base font-black text-[#22c55e] font-mono">${count.toLocaleString()}枚</div>
          </div>
        `;
      }).join('');

      container.innerHTML = itemsHtml;
    }
  } catch(e) {
    console.error("loadRanking Error:", e);
    container.innerHTML = `
      <div class="premium-glass p-8 flex flex-col items-center justify-center text-center gap-3">
        <span class="text-2xl">⚠️</span>
        <p class="text-sm font-black text-rose-500">ランキングの取得に失敗しました</p>
      </div>`;
  }
}

// ── 👥 配布員名簿 (Roster) ロード・描画 ───────────────────────────
async function loadRoster() {
  const container = $('manager-roster-list-container');
  if (!container) return;
  try {
    const data = await callApi('getRoster');
    if (data && data.success && Array.isArray(data.roster)) {
      const list = data.roster;
      if (list.length === 0) {
        container.innerHTML = `
          <div class="premium-glass p-8 flex flex-col items-center justify-center text-center gap-3">
            <span class="text-2xl">👥</span>
            <p class="text-sm font-black text-white/60">現在、登録されている配布員はいません</p>
          </div>`;
        return;
      }
      
      const itemsHtml = list.map(r => `
        <div class="premium-glass p-5 flex justify-between items-center active:bg-white/5 transition-colors">
          <div class="min-w-0 flex-1">
            <div class="text-sm font-black text-white">${(r.name||'').replace(/&/g,'&amp;').replace(/</g,'&lt;')}</div>
            <div class="text-[9px] text-white/40 font-mono mt-0.5">ID: ${(r.id||'').replace(/&/g,'&amp;').replace(/</g,'&lt;')}</div>
          </div>
          <button onclick="window.openLineChat('${r.id}', '${(r.name||'').replace(/'/g,'&quot;')}')" style="background: rgba(37,99,235,0.1); color: #2563eb; border: 1px solid rgba(37,99,235,0.2);" class="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 active:scale-[0.95] transition-all">
            💬 LINE連絡
          </button>
        </div>`).join('');
      container.innerHTML = itemsHtml;
    } else {
      throw new Error("Failed response");
    }
  } catch(e) {
    console.error("loadRoster Error:", e);
    container.innerHTML = `
      <div class="premium-glass p-8 flex flex-col items-center justify-center text-center gap-3">
        <span class="text-2xl">⚠️</span>
        <p class="text-sm font-black text-rose-500">配布員名簿の取得に失敗しました</p>
      </div>`;
  }
}

window.openLineChat = function(staffId, staffName) {
  const text = `【本部からのご連絡】\n${staffName}さん、ポスティング活動について確認したい件がございます。お手数ですが、本トークに折り返しご連絡いただけますでしょうか。`;
  const lineUrl = `https://line.me/R/share?text=${encodeURIComponent(text)}`;
  window.open(lineUrl, '_blank');
};

// ── 💬 マップから「配布打診」機能 ───────────────────────────────
window.dispatchLineRequest = async function(areaName) {
  try {
    const data = await callApi('getRoster');
    if (data && data.success && Array.isArray(data.roster)) {
      const roster = data.roster;
      if (roster.length === 0) {
        alert("登録されている配布員がいません。先に配布員登録を行ってください。");
        return;
      }
      
      let bodyHtml = `<div class="space-y-3 max-h-[40dvh] overflow-y-auto pr-1">`;
      roster.forEach(r => {
        bodyHtml += `
          <button onclick="window.sendDispatchMessage('${r.name}', '${areaName}')" 
            class="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white text-left font-black text-sm hover:bg-white/10 active:scale-[0.98] transition-all flex justify-between items-center">
            <span>${r.name}</span>
            <span class="text-xs text-white/40">ID: ${r.id}</span>
          </button>`;
      });
      bodyHtml += `</div>`;
      
      showModal({
        title: `💬 配布を打診: ${areaName}`,
        body: "",
        actions: [{ label: 'キャンセル', style: 'cancel' }]
      });
      
      $('admin-modal-body').innerHTML = bodyHtml;
    }
  } catch(e) {
    alert("配布員名簿の取得に失敗しました: " + e.message);
  }
};

window.sendDispatchMessage = function(staffName, areaName) {
  const text = `【配布打診のご連絡】\n${staffName}さん、現在ポスティング進捗を調整しております。\nよろしければ、「${areaName}」の配布をお願いできますでしょうか？`;
  const lineUrl = `https://line.me/R/share?text=${encodeURIComponent(text)}`;
  window.open(lineUrl, '_blank');
};


