const $ = id => document.getElementById(id);
let allPoints = [], areaSummary = [], roster = [];

// プレミアム・インタラクション・スキル (JS Touch Handler)
document.addEventListener('touchstart', e => {
  const el = e.target.closest('.btn-neu, .clickable-card, .nav-btn');
  if (!el) return;
  if (el.classList.contains('btn-neu')) el.classList.add('pressed-primary');
  if (el.classList.contains('clickable-card')) el.classList.add('pressed-secondary');
  if (el.classList.contains('nav-btn')) el.classList.add('pressed-nav');
}, {passive: true});

document.addEventListener('touchend', removePressed);
document.addEventListener('touchcancel', removePressed);
function removePressed() {
  document.querySelectorAll('.pressed-primary, .pressed-secondary, .pressed-nav').forEach(el => {
    el.classList.remove('pressed-primary', 'pressed-secondary', 'pressed-nav');
  });
}

// GAS API CONFIG (JSON ONLY)
const API_URL = "https://script.google.com/macros/s/AKfycbyFoJ2Tp7F4MOZ3lNyVDLTl45fVlV-hyAC1uYGL42oXkjBJ3ylST3KUYpaTb0lpK9FmSA/exec";

async function callApi(action, params = {}) {
  const isPost = (action === 'submitDistribution' || action === 'registerStaff');
  let url = API_URL + "?action=" + action;
  
  let options = {
    method: isPost ? 'POST' : 'GET',
    redirect: 'follow'
  };

  if (isPost) {
    options.body = JSON.stringify({ action: action, ...params });
    options.headers = { 'Content-Type': 'text/plain;charset=utf-8' };
  } else {
    for (let key in params) {
      url += "&" + key + "=" + encodeURIComponent(params[key]);
    }
  }
  
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    
    const data = await response.json();
    if (data.success === false) {
      throw new Error(data.message || "API Error");
    }
    return data;
  } catch (err) {
    console.error("API Connection Error:", err);
    alert("通信エラーが発生しました。\n内容: " + err.message);
    throw err;
  }
}

function startApp() {
  $('screen-gateway').classList.add('hidden');
  $('loading').classList.remove('hidden');
  loadData();
}

function setSyncStatus(state) {
  const statusEl = $('sync-status');
  if (!statusEl) return;
  statusEl.className = 'w-2 h-2 rounded-full transition-all duration-300';
  if (state === 'online') {
    statusEl.classList.add('bg-[#22c55e]', 'shadow-[0_0_8px_#22c55e]');
  } else if (state === 'offline') {
    statusEl.classList.add('bg-[#f59e0b]', 'shadow-[0_0_8px_#f59e0b]');
  } else if (state === 'syncing') {
    statusEl.classList.add('bg-[#2563eb]', 'shadow-[0_0_8px_#2563eb]', 'animate-pulse');
  }
}

let isSyncing = false;
async function syncOfflineQueue() {
  if (isSyncing) return;
  if (!navigator.onLine) {
    setSyncStatus('offline');
    return;
  }
  const queue = JSON.parse(localStorage.getItem('offline_queue') || '[]');
  if (queue.length === 0) {
    setSyncStatus('online');
    return;
  }

  isSyncing = true;
  setSyncStatus('syncing');
  console.log(`Offline sync: processing ${queue.length} report(s)...`);

  const failedItems = [];
  for (const item of queue) {
    try {
      const result = await callApi('submitDistribution', item);
      if (!result || !result.success) {
        failedItems.push(item);
      }
    } catch (e) {
      console.error('Failed to sync offline item:', e);
      failedItems.push(item);
    }
  }

  localStorage.setItem('offline_queue', JSON.stringify(failedItems));
  isSyncing = false;

  if (failedItems.length === 0) {
    console.log('Offline sync completed successfully.');
    setSyncStatus('online');
    // Refresh main data after sync completes
    await loadData(true);
  } else {
    console.warn(`${failedItems.length} items failed to sync. Will retry.`);
    setSyncStatus('offline');
  }
}

async function loadData(skipSync = false) {
  if (!skipSync && navigator.onLine) {
    await syncOfflineQueue();
  } else if (!navigator.onLine) {
    setSyncStatus('offline');
  }

  try {
    const data = await callApi('getAppData');
    if (data && data.success) {
      areaSummary = data.areas;
      renderAreas();
      updateStats();
      
      switchPage('settings');
      
      $('app').classList.remove('hidden');
      setTimeout(() => {
        $('app').classList.remove('opacity-0');
        $('loading').classList.add('opacity-0');
        setTimeout(() => $('loading').classList.add('hidden'), 400);
      }, 100);
    } else {
      throw new Error(data ? data.message : "データが空です");
    }
  } catch (err) {
    console.error("Startup Error:", err);
    $('loading').classList.add('hidden');
    $('screen-gateway').classList.remove('hidden');
  }
}

async function updateRecord(areaName, rowId, field, val) {
  const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
  const staffName = `${userInfo.last || ''} ${userInfo.first || ''}`.trim();
  
  const payload = {
    areaName: areaName,
    rowId: rowId,
    staffName: staffName,
    isDone: val,
    action: 'submitDistribution'
  };

  // Optimistic UI updates if offline or connection fails
  if (!navigator.onLine) {
    saveToOfflineQueue(payload);
    applyOptimisticCheck(areaName, rowId, val);
    return;
  }
  
  try {
    const result = await callApi('submitDistribution', payload);
    if (result.success) {
      loadData(true); // skip recursive sync
    }
  } catch (e) {
    console.warn("API write failed. Storing report to offline queue.");
    saveToOfflineQueue(payload);
    applyOptimisticCheck(areaName, rowId, val);
  }
}

function saveToOfflineQueue(payload) {
  const queue = JSON.parse(localStorage.getItem('offline_queue') || '[]');
  const filtered = queue.filter(item => !(item.areaName === payload.areaName && item.rowId === payload.rowId));
  filtered.push(payload);
  localStorage.setItem('offline_queue', JSON.stringify(filtered));
  setSyncStatus('offline');
}

function applyOptimisticCheck(areaName, rowId, val) {
  const label = document.querySelector(`input[onchange*="${areaName}"][onchange*="${rowId}"]`)?.closest('label');
  if (label) {
    const checkbox = label.querySelector('div');
    const statusText = label.querySelector('span');
    if (val) {
      label.style.cssText = 'background: rgba(16,185,129,0.05); border: 1px solid rgba(16,185,129,0.2);';
      if (checkbox) {
        checkbox.style.cssText = 'border-color: #10b981; background-color: #10b981; box-shadow: 0 0 10px rgba(16,185,129,0.4);';
        checkbox.innerHTML = '<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="4" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>';
      }
      if (statusText) {
        statusText.className = 'text-[10px] font-black uppercase tracking-widest text-[#10b981]';
        statusText.textContent = 'MISSION COMPLETED (OFFLINE)';
      }
    } else {
      label.style.cssText = 'background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.05);';
      if (checkbox) {
        checkbox.style.cssText = 'border-color: rgba(255,255,255,0.2); background-color: transparent;';
        checkbox.innerHTML = '';
      }
      if (statusText) {
        statusText.className = 'text-[10px] font-black uppercase tracking-widest text-white/60';
        statusText.textContent = 'READY TO DEPLOY';
      }
    }
  }
}

window.addEventListener('online', () => {
  console.log("Device is online. Initializing background sync.");
  syncOfflineQueue();
});

window.addEventListener('offline', () => {
  console.log("Device went offline.");
  setSyncStatus('offline');
});

function switchPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  if (id === 'settings') renderSettings();
  
  // 全画面共通：登録済みなら下ナビを表示、未登録なら隠す
  const nav = $('bottom-nav');
  if (nav) nav.style.display = localStorage.getItem('user_info') ? '' : 'none';

  const target = $(id === 'detail' ? 'page-detail' : (id === 'settings' ? 'page-settings' : 'page-areas'));
  if(target) target.classList.remove('hidden');
  
  // pb-64の制御：設定画面かつ未登録(Card 1)のときのみpb-64を除外。それ以外はpb-64を追加してスクロール領域を確保。
  const userInfo = JSON.parse(localStorage.getItem('user_info'));
  if (id === 'settings' && !userInfo) {
    $('content').classList.remove('pb-64');
  } else {
    $('content').classList.add('pb-64');
  }

  document.querySelectorAll('.nav-btn').forEach((b, i) => { b.style.opacity = (id === 'areas' && i === 0) || (id === 'settings' && i === 1) ? '1' : '0.3'; });

  // スクロール位置の設定：設定画面かつ登録済みの場合は初期位置120にスクロール、それ以外は0にリセット
  if (id === 'settings' && userInfo) {
    $('content').scrollTo(0, 120);
  } else {
    $('content').scrollTo(0, 0);
  }
}

function updateStats() {
  const total = areaSummary.length;
  if (total === 0) {
    $('header-pct').textContent = '0%';
    return;
  }
  const avg = areaSummary.reduce((acc, cur) => acc + (cur.progress || 0), 0) / total;
  $('header-pct').textContent = Math.round(avg) + '%';
}

async function saveProfile() {
  const last = $('user-last').value.trim(), first = $('user-first').value.trim();
  if (!last || !first) { alert('姓名を入力してください'); return; }
  
  $('loading').classList.remove('hidden');
  $('loading').classList.remove('opacity-0');
  
  await new Promise(r => setTimeout(r, 50));
  
  try {
    const res = await callApi('registerStaff', { lastName: last, firstName: first });
    if (res && res.success) {
      localStorage.setItem('user_info', JSON.stringify({last, first, id: res.id}));
      switchPage('settings');
      $('loading').classList.add('opacity-0');
      setTimeout(() => $('loading').classList.add('hidden'), 700);
    } else {
      throw new Error('Failed');
    }
  } catch (err) {
    alert('通信エラーが発生しました。');
    $('loading').classList.add('opacity-0');
    setTimeout(() => $('loading').classList.add('hidden'), 700);
  }
}

window.onload = () => {
  console.log("POSTING MAP PRO initialized.");
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => console.log('Service Worker registered. Scope:', reg.scope))
      .catch(err => console.error('Service Worker registration failed:', err));
  }
};
