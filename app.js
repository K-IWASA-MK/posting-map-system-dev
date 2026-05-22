const $ = id => document.getElementById(id);

// デバッグログ出力関数
window.logDebug = function(msg) {
  console.log("[DEBUG]", msg);
  const logEl = $('debug-log');
  const contentEl = $('debug-log-content');
  if (logEl && contentEl) {
    logEl.classList.remove('hidden');
    const item = document.createElement('div');
    item.className = 'border-b border-red-900/30 pb-0.5';
    item.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    contentEl.appendChild(item);
    logEl.scrollTop = logEl.scrollHeight;
  }
};
window.onerror = function(message, source, lineno, colno, error) {
  if (message === "Script error.") return false;
  logDebug(`ERROR: ${message} at ${source}:${lineno}:${colno}`);
  return false;
};
window.onunhandledrejection = function(event) {
  logDebug(`UNHANDLED PROMISE: ${event.reason}`);
};

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
    logDebug(`callApi: action=${action}, params=${JSON.stringify(params)}`);
    logDebug(`callApi fetching: url=${url}`);
    const response = await fetch(url, options);
    logDebug(`callApi response status: ${response.status} (${response.statusText})`);
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    
    const text = await response.text();
    logDebug(`callApi response text length: ${text.length}`);
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseErr) {
      logDebug(`callApi JSON parse failed: ${text.substring(0, 100)}`);
      throw new Error("JSON形式ではない応答を受け取りました");
    }
    
    if (data.success === false) {
      throw new Error(data.message || "API Error");
    }
    return data;
  } catch (err) {
    logDebug(`callApi error: ${err.message}`);
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
    logDebug(`Startup Error: ${err.message}`);
    $('loading').classList.add('hidden');
    $('screen-gateway').classList.remove('hidden');
  }
}

let numpadContext = null;

function openNumpad(areaName, rowId, initialCount, isDoneToggle = false, checkbox = null) {
  numpadContext = {
    areaName,
    rowId,
    isDoneToggle,
    checkbox,
    currentVal: initialCount ? String(initialCount) : '0'
  };
  
  $('numpad-display').textContent = numpadContext.currentVal;
  
  const modal = $('numpad-modal');
  modal.classList.remove('pointer-events-none', 'opacity-0');
  const content = modal.firstElementChild;
  content.classList.remove('translate-y-full');
}

function closeNumpad() {
  if (!numpadContext) return;
  
  if (numpadContext.isDoneToggle && numpadContext.checkbox) {
    numpadContext.checkbox.checked = false;
  }
  
  const modal = $('numpad-modal');
  modal.classList.add('opacity-0', 'pointer-events-none');
  const content = modal.firstElementChild;
  content.classList.add('translate-y-full');
  
  numpadContext = null;
}

function pressNum(key) {
  if (!numpadContext) return;
  
  if (key === 'C') {
    numpadContext.currentVal = '0';
  } else if (key === 'OK') {
    const valNum = parseFloat(numpadContext.currentVal) || 0;
    const { areaName, rowId } = numpadContext;
    
    // Update local state instantly
    const p = allPoints.find(point => point.rowId === rowId);
    if (p) {
      p.isDone = true;
      p.count = valNum;
      
      const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
      p.staffName = `${userInfo.last || ''} ${userInfo.first || ''}`.trim();
      
      const now = new Date();
      p.completedAt = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      const card = $(`point-card-${rowId}`);
      if (card) {
        card.innerHTML = renderPointCardHtml(areaName, p);
      }
    }
    
    // De-couple toggle so closeNumpad doesn't reset checkbox
    numpadContext.isDoneToggle = false;
    closeNumpad();
    
    // Update server
    updateRecord(areaName, rowId, true, valNum);
    return;
  } else {
    // Digit key pressed
    if (numpadContext.currentVal === '0') {
      numpadContext.currentVal = String(key);
    } else {
      if (numpadContext.currentVal.length < 5) {
        numpadContext.currentVal += String(key);
      }
    }
  }
  
  $('numpad-display').textContent = numpadContext.currentVal;
}

async function updateRecord(areaName, rowId, isDone, count) {
  const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
  const staffName = `${userInfo.last || ''} ${userInfo.first || ''}`.trim();
  const staffId = userInfo.id || '';
  
  const payload = {
    areaName: areaName,
    rowId: rowId,
    staffName: staffName,
    staffId: staffId,
    isDone: isDone,
    count: count,
    action: 'submitDistribution'
  };

  // Optimistic UI updates if offline or connection fails
  if (!navigator.onLine) {
    saveToOfflineQueue(payload);
    applyOptimisticCheck(areaName, rowId, isDone, count);
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
    applyOptimisticCheck(areaName, rowId, isDone, count);
  }
}

function saveToOfflineQueue(payload) {
  const queue = JSON.parse(localStorage.getItem('offline_queue') || '[]');
  const filtered = queue.filter(item => !(item.areaName === payload.areaName && item.rowId === payload.rowId));
  filtered.push(payload);
  localStorage.setItem('offline_queue', JSON.stringify(filtered));
  setSyncStatus('offline');
}

function applyOptimisticCheck(areaName, rowId, isDone, count) {
  const p = allPoints.find(point => point.rowId === rowId);
  if (p) {
    p.isDone = isDone;
    p.count = count;
    if (isDone) {
      const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
      p.staffName = `${userInfo.last || ''} ${userInfo.first || ''}`.trim();
      const now = new Date();
      p.completedAt = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    } else {
      p.completedAt = '';
      p.staffName = '';
    }
    
    const card = $(`point-card-${rowId}`);
    if (card) {
      card.innerHTML = renderPointCardHtml(areaName, p);
      if (!navigator.onLine) {
        const statusText = card.querySelector('label span');
        if (statusText) {
          statusText.textContent = isDone ? 'MISSION COMPLETED (OFFLINE)' : 'READY TO DEPLOY (OFFLINE)';
        }
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

async function switchPage(id, force = false) {
  const pages = document.querySelectorAll('.page');
  const targetId = id === 'detail' ? 'page-detail' : (id === 'settings' ? 'page-settings' : 'page-areas');
  const target = $(targetId);
  if (!target) return;

  // すでにアクティブなら多重遷移を防ぐためスキップ
  if (!force && !target.classList.contains('hidden') && target.style.opacity === '1') return;

  // 1. 現在表示されているページを上にスライドさせながらフェードアウト
  const activePage = Array.from(pages).find(p => !p.classList.contains('hidden'));
  if (activePage) {
    activePage.style.opacity = '0';
    activePage.style.transform = 'translateY(-12px)';
    await new Promise(r => setTimeout(r, 200)); // アニメーション時間分待つ
    activePage.classList.add('hidden');
  } else {
    pages.forEach(p => {
      p.classList.add('hidden');
      p.style.opacity = '0';
    });
  }

  // 2. 設定画面の場合はレンダリングを行う
  if (id === 'settings') renderSettings();
  
  // 3. ナビゲーションの表示制御
  const nav = $('bottom-nav');
  if (nav) nav.style.display = localStorage.getItem('user_info') ? '' : 'none';

  // 4. 次のページを少し下から準備してフェードイン
  target.style.opacity = '0';
  target.style.transform = 'translateY(12px)';
  target.classList.remove('hidden');
  
  // リフローを強制してアニメーションを適用
  target.offsetHeight; 
  
  target.style.opacity = '1';
  target.style.transform = 'translateY(0)';
  
  // pb-64の制御（入力欄のスクロール領域確保）
  if (id === 'settings') {
    $('content').classList.remove('pb-64');
  } else {
    $('content').classList.add('pb-64');
  }

  // 下ナビのタブのアクティブ状態の不透明度を調整
  document.querySelectorAll('.nav-btn').forEach((b, i) => { 
    b.style.opacity = (id === 'areas' && i === 0) || (id === 'settings' && i === 1) ? '1' : '0.3'; 
  });

  // スクロール位置のリセット
  if (id === 'settings' && localStorage.getItem('user_info')) {
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

function cleanNameInput(str) {
  if (!str) return "";
  // 1. スペース（半角・全角）をすべて除去
  let s = str.replace(/[\s\u3000]/g, "");
  
  // 2. 半角カタカナを全角カタカナに変換
  const kanaMap = {
    'ｱ': 'ア', 'ｲ': 'イ', 'ｳ': 'ウ', 'ｴ': 'エ', 'ｵ': 'オ',
    'ｶ': 'カ', 'ｷ': 'キ', 'ｸ': 'ク', 'ｹ': 'ケ', 'ｺ': 'コ',
    'ｻ': 'サ', 'ｼ': 'シ', 'ｽ': 'ス', 'ｾ': 'セ', 'ｿ': 'ソ',
    'ﾀ': 'タ', 'ﾁ': 'チ', 'ﾂ': 'ツ', 'ﾃ': 'テ', 'ﾄ': 'ト',
    'ﾅ': 'ナ', 'ﾆ': 'ニ', 'ﾇ': 'ヌ', 'ﾈ': 'ネ', 'ﾉ': 'ノ',
    'ﾊ': 'ハ', 'ﾋ': 'ヒ', 'ﾌ': 'フ', 'ﾍ': 'ヘ', 'ﾎ': 'ホ',
    'ﾏ': 'マ', 'ﾐ': 'ミ', 'ﾑ': 'ム', 'ﾒ': 'メ', 'ﾓ': 'モ',
    'ﾔ': 'ヤ', 'ﾕ': 'ユ', 'ﾖ': 'ヨ',
    'ﾗ': 'ラ', 'ﾘ': 'リ', 'ﾙ': 'ル', 'ﾚ': 'レ', 'ﾛ': 'ロ',
    'ﾜ': 'ワ', 'ｦ': 'ヲ', 'ﾝ': 'ン',
    'ｧ': 'ァ', 'ｨ': 'ィ', 'ｩ': 'ゥ', 'ｪ': 'ェ', 'ｫ': 'ォ',
    'ｬ': 'ャ', 'ｭ': 'ュ', 'ｮ': 'ョ', 'ｯ': 'ッ',
    'ｰ': 'ー', 'ﾞ': '゛', 'ﾟ': '゜'
  };
  let reg = new RegExp('[' + Object.keys(kanaMap).join('') + ']', 'g');
  s = s.replace(reg, m => kanaMap[m]);
  
  // 濁点・半濁点の結合処理
  s = s.replace(/カ゛/g, 'ガ').replace(/キ゛/g, 'ギ').replace(/ク゛/g, 'グ').replace(/ケ゛/g, 'ゲ').replace(/コ゛/g, 'ゴ')
       .replace(/サ゛/g, 'ザ').replace(/シ゛/g, 'ジ').replace(/ス゛/g, 'ズ').replace(/セ゛/g, 'ゼ').replace(/ソ゛/g, 'ゾ')
       .replace(/タ゛/g, 'ダ').replace(/チ゛/g, 'ヂ').replace(/ツ゛/g, 'ヅ').replace(/テ゛/g, 'デ').replace(/ト゛/g, 'ド')
       .replace(/ハ゛/g, 'バ').replace(/ヒ゛/g, 'ビ').replace(/フ゛/g, 'ブ').replace(/ヘ゛/g, 'ベ').replace(/ホ゛/g, 'ボ')
       .replace(/ハ゜/g, 'パ').replace(/ヒ゜/g, 'ピ').replace(/フ゜/g, 'プ').replace(/ヘ゜/g, 'ペ').replace(/ホ゜/g, 'ポ');
       
  return s;
}

async function saveProfile() {
  logDebug("saveProfile: click triggered");
  const rawLast = $('user-last').value, rawFirst = $('user-first').value;
  logDebug(`saveProfile: inputs: last='${rawLast}', first='${rawFirst}'`);
  const last = cleanNameInput(rawLast);
  const first = cleanNameInput(rawFirst);
  logDebug(`saveProfile: cleaned: last='${last}', first='${first}'`);
  
  if (!last || !first) {
    logDebug("saveProfile: validation failed (empty last/first name)");
    alert('姓名を入力してください');
    return;
  }
  
  logDebug("saveProfile: showing loading indicator");
  $('loading').classList.remove('hidden');
  $('loading').classList.remove('opacity-0');
  
  await new Promise(r => setTimeout(r, 50));
  
  try {
    logDebug("saveProfile: invoking callApi('registerStaff')");
    const res = await callApi('registerStaff', { lastName: last, firstName: first });
    logDebug(`saveProfile: API result: ${JSON.stringify(res)}`);
    if (res && res.success) {
      logDebug("saveProfile: success! storing user_info to localStorage");
      localStorage.setItem('user_info', JSON.stringify({last, first, id: res.id}));
      logDebug("saveProfile: switching to settings page");
      switchPage('settings', true);
      $('loading').classList.add('opacity-0');
      setTimeout(() => $('loading').classList.add('hidden'), 700);
    } else {
      throw new Error('Failed');
    }
  } catch (err) {
    logDebug(`saveProfile: caught exception: ${err.message}`);
    alert('通信エラーが発生しました。');
    $('loading').classList.add('opacity-0');
    setTimeout(() => $('loading').classList.add('hidden'), 700);
  }
}

window.onload = () => {
  console.log("POSTING MAP PRO initialized.");
  // キャッシュ問題を回避するため一時的に無効化
  /*
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => console.log('Service Worker registered. Scope:', reg.scope))
      .catch(err => console.error('Service Worker registration failed:', err));
  }
  */
};
