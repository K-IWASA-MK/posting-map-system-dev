const $ = id => document.getElementById(id);

// デバッグログ出力関数 (本番用: コンソールのみ出力)
window.logDebug = function(msg) {
  console.log("[DEBUG]", msg);
};
window.onerror = function(message, source, lineno, colno, error) {
  if (message === "Script error.") return false;
  logDebug(`ERROR: ${message} at ${source}:${lineno}:${colno}`);
  return false;
};
window.onunhandledrejection = function(event) {
  logDebug(`UNHANDLED PROMISE: ${event.reason}`);
};

let allPoints = [], areaSummary = [], roster = [], rankingData = [];
let currentCity = null;
let lastAreaSubPage = 'areas'; // 直前のエリアサブページ ('areas' または 'detail') を記憶
let scrollPositions = { areas: 0, detail: 0, settings: 0, ranking: 0 };
const pageIdMap = {
  'page-areas': 'areas',
  'page-detail': 'detail',
  'page-settings': 'settings',
  'page-ranking': 'ranking'
};

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
  const MAX_RETRIES = 3;
  let delay = 1000;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const queryParams = new URLSearchParams({
      action: action,
      _t: Date.now().toString(), // キャッシュバスター：iOS WebKitの302キャッシュ回避
      ...params
    });
    
    const url = `${API_URL}?${queryParams.toString()}`;
    const options = {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-store', // キャッシュを利用しない
      redirect: 'follow'
    };
    
    try {
      logDebug(`[callApi] START (Attempt ${attempt}/${MAX_RETRIES}): action=${action}`);
      logDebug(`[callApi] URL: ${url.substring(0, 80)}...`);
      
      const response = await fetch(url, options);
      
      logDebug(`[callApi] FETCH OK. status=${response.status}, type=${response.type}`);
      
      if (!response.ok) {
        logDebug(`[callApi] HTTP ERROR: status=${response.status}`);
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      logDebug(`[callApi] Calling response.text()...`);
      const text = await response.text();
      logDebug(`[callApi] TEXT RECEIVED (length=${text.length})`);
      logDebug(`[callApi] TEXT PREVIEW: ${text.substring(0, 150)}`);
      
      logDebug(`[callApi] Parsing JSON...`);
      let data;
      try {
        data = JSON.parse(text);
        logDebug(`[callApi] JSON PARSE SUCCESS. success=${data.success}`);
      } catch (parseErr) {
        logDebug(`[callApi] JSON parse failed. Error=${parseErr.message}`);
        logDebug(`[callApi] Failed Text snippet: ${text.substring(0, 200)}`);
        throw new Error("JSON形式ではない応答を受け取りました: " + parseErr.message);
      }
      
      if (data.success === false) {
        logDebug(`[callApi] API returned success=false. msg=${data.message}`);
        throw new Error(data.message || "API Error");
      }
      return data;
    } catch (err) {
      logDebug(`[callApi] Attempt ${attempt} failed: ${err.message}`);
      if (attempt === MAX_RETRIES) {
        logDebug(`[callApi] ALL ATTEMPTS FAILED.`);
        console.error("API Connection Error:", err);
        alert("通信エラーが発生しました。\n内容: " + err.message);
        throw err;
      }
      logDebug(`[callApi] Waiting ${delay}ms before retry...`);
      await new Promise(r => setTimeout(r, delay));
      delay *= 2;
    }
  }
}

function startApp(profile = null) {
  $('screen-gateway').classList.add('hidden');
  $('loading').classList.remove('hidden');
  loadData();
}

function setSyncStatus(state) {
  const statusEl = $('sync-status');
  const textEl = $('sync-text');
  if (!statusEl) return;
  statusEl.className = 'w-2 h-2 rounded-full transition-all duration-300';

  if (textEl) {
    textEl.className = 'text-[8px] font-black uppercase tracking-[0.2em] transition-all duration-300';
  }

  if (state === 'online') {
    statusEl.classList.add('bg-[#22c55e]', 'shadow-[0_0_8px_#22c55e]', 'animate-soft-pulse');
    if (textEl) {
      textEl.textContent = 'ONLINE';
      textEl.classList.add('text-[#22c55e]');
    }
  } else if (state === 'offline') {
    statusEl.classList.add('bg-[#f59e0b]', 'shadow-[0_0_8px_#f59e0b]');
    if (textEl) {
      textEl.textContent = 'OFFLINE';
      textEl.classList.add('text-[#f59e0b]');
    }
  } else if (state === 'syncing') {
    statusEl.classList.add('bg-[#2563eb]', 'shadow-[0_0_8px_#2563eb]', 'animate-pulse');
    if (textEl) {
      textEl.textContent = 'SYNCING';
      textEl.classList.add('text-[#2563eb]', 'animate-pulse');
    }
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
  logDebug("[loadData] START");
  if (!skipSync && navigator.onLine) {
    logDebug("[loadData] Syncing offline queue...");
    await syncOfflineQueue();
  } else if (!navigator.onLine) {
    logDebug("[loadData] Offline. Setting status...");
    setSyncStatus('offline');
  }

  try {
    logDebug("[loadData] Fetching getAppData...");
    const data = await callApi('getAppData');
    logDebug("[loadData] getAppData fetched successfully.");
    if (data && data.success) {
      areaSummary = data.areas;
      if (data.branchName) localStorage.setItem('branch_name', data.branchName);
      
      logDebug("[loadData] Rendering areas...");
      renderAreas();
      logDebug("[loadData] Rendering areas OK. Updating stats...");
      updateStats();
      
      if (!skipSync) {
        logDebug("[loadData] Initial load. Switching page to settings and animating app entry...");
        switchPage('settings');
        logDebug("[loadData] Showing main app div...");
        $('screen-gateway').classList.add('hidden');
        $('app').classList.remove('hidden');
        setTimeout(() => {
          $('app').classList.remove('opacity-0');
          $('loading').classList.add('opacity-0');
          setTimeout(() => $('loading').classList.add('hidden'), 400);
        }, 50);
      }
    } else {
      throw new Error(data ? data.message : "データが空です");
    }
  } catch (err) {
    console.error("Startup Error:", err);
    logDebug(`[loadData] ERROR: ${err.message}`);
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
  const targetId = id === 'detail' ? 'page-detail' : (id === 'settings' ? 'page-settings' : (id === 'ranking' ? 'page-ranking' : 'page-areas'));
  const target = $(targetId);
  if (!target) return;

  // すでにアクティブなら多重遷移を防ぐためスキップ
  if (!force && !target.classList.contains('hidden') && target.style.opacity === '1') return;

  // エリア関連のページ切り替えであれば直前のページタイプを記憶
  if (id === 'areas' || id === 'detail') {
    lastAreaSubPage = id;
  }

  // 1. 現在表示されているページを上にスライドさせながらフェードアウト
  const activePage = Array.from(pages).find(p => !p.classList.contains('hidden'));
  if (activePage) {
    const activeId = pageIdMap[activePage.id];
    if (activeId) {
      scrollPositions[activeId] = $('content').scrollTop;
    }
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
  if (id === 'ranking') {
    if (typeof renderRanking === 'function') renderRanking();
  }
  
  // 3. ナビゲーションの表示制御
  const nav = $('bottom-nav');
  const hasUser = !!localStorage.getItem('user_info');
  if (nav) nav.style.display = hasUser ? '' : 'none';

  // 設定画面（登録・IDカード）では無駄なスクロールを避けるが、画面サイズが小さい場合はスクロール可能にする
  const contentEl = $('content');
  const settingsPage = document.getElementById('page-settings');
  if (id === 'settings') {
    if (!hasUser) {
      if (settingsPage) settingsPage.style.paddingBottom = '0px';
    } else {
      if (settingsPage) settingsPage.style.paddingBottom = '140px';
    }
    contentEl.scrollTop = 0;
    contentEl.style.overflowY = 'hidden';
  } else {
    contentEl.style.overflowY = 'auto';
  }

  // 4. 次のページを少し下から準備してフェードイン
  target.style.opacity = '0';
  target.style.transform = 'translateY(12px)';
  target.classList.remove('hidden');
  
  // リフローを強制してアニメーションを適用
  target.offsetHeight; 
  
  target.style.opacity = '1';
  target.style.transform = 'translateY(0)';
  

  // 下ナビのタブのアクティブ状態の不透明度を調整
  document.querySelectorAll('.nav-btn').forEach((b, i) => { 
    const isActive = ((id === 'areas' || id === 'detail') && i === 0) || 
                     (id === 'ranking' && i === 1) || 
                     (id === 'settings' && i === 2);
    b.style.opacity = isActive ? '1' : '0.3'; 
  });

  // スクロール位置の復元
  $('content').scrollTo(0, scrollPositions[id] || 0);
}

// 下ナビの「エリア」ボタンタップ時に直前のサブページへ戻る
function navigateToAreaTab() {
  switchPage(lastAreaSubPage);
}

function updateStats() {
  let totalDone = 0;
  let totalPoints = 0;
  areaSummary.forEach(area => {
    totalDone += area.done || 0;
    totalPoints += area.total || 0;
  });

  const countEl = $('header-count');
  const pctEl = $('header-pct');

  if (totalPoints === 0) {
    if (countEl) countEl.textContent = '(0/0)';
    if (pctEl) pctEl.textContent = '0%';
    return;
  }

  const pct = Math.round((totalDone / totalPoints) * 100);
  
  // 全体数の桁数に合わせて、完了数の左側を半角スペースでパディングする
  const doneStr = String(totalDone);
  const totalStr = String(totalPoints);
  const paddedDone = doneStr.padStart(totalStr.length, ' ');

  if (countEl) countEl.textContent = `(${paddedDone}/${totalPoints})`;
  if (pctEl) pctEl.textContent = `${pct}%`;
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

async function safeInitApp() {
  logDebug("safeInitApp invoked.");
  console.log("POSTING MAP PRO safeInitApp started.");
  
  const liffId = "2010177345-h9Fjv1iU";
  const btn = $('btn-login-manual');
  const spinner = $('login-spinner');
  const subtitle = $('gateway-subtitle');
  
  if (typeof liff !== 'undefined') {
    try {
      logDebug("LIFF INIT START"); // ① LIFF初期化開始
      // LINE JS Bridge の接続確立を待つ安全ディレイ
      await new Promise(r => setTimeout(r, 200));

      // ⏳ 5秒でタイムアウトする安全装置
      const liffInitPromise = liff.init({ liffId: liffId });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("LINEログインの応答がタイムアウトしました(5秒)")), 5000)
      );

      await Promise.race([liffInitPromise, timeoutPromise]);
      logDebug("LIFF INIT OK"); // ② LIFF初期化成功
      
      logDebug("LOGIN CHECK"); // ③ login判定
      if (liff.isLoggedIn()) {
        logDebug("LOGIN OK"); // ④ login成功
        try {
          // 初期化完了後のLINE内部トークン処理を安定させるディレイ
          await new Promise(r => setTimeout(r, 300));

          logDebug("PROFILE START"); // ⑤ profile取得開始
          const profile = await liff.getProfile();
          logDebug("PROFILE OK"); // ⑥ profile取得成功
          console.log(profile);

          let userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
          
          // LINE IDが変わっている、または未登録の場合のみGASへ同期登録する
          if (!userInfo.id || userInfo.lineUserId !== profile.userId) {
            logDebug("API START"); // ⑦ API開始
            const res = await callApi('registerStaff', { 
              lastName: profile.displayName, 
              firstName: "(LINE)" 
            });
            logDebug("API OK"); // ⑧ APIレスポンス成功
            if (res && res.success) {
              userInfo = {
                last: profile.displayName,
                first: "",
                id: res.id,
                lineUserId: profile.userId,
                picture: profile.pictureUrl
              };
              localStorage.setItem('user_info', JSON.stringify(userInfo));
              logDebug("Registered! Staff ID: " + res.id);
            } else {
              throw new Error("GAS registration failed");
            }
          } else {
            // すでに登録済みでLINE画像などが最新でない場合はローカルキャッシュのみ更新
            userInfo.picture = profile.pictureUrl;
            localStorage.setItem('user_info', JSON.stringify(userInfo));
          }

          // LINE WebViewのタイミング問題対策（800ms delay）
          await new Promise(r => setTimeout(r, 800));
          
          logDebug("START APP"); // ⑨ startApp開始
          startApp(profile);
        } catch (err) {
          console.error("LIFF PROFILE ERROR", err);
          logDebug("LIFF PROFILE ERROR: " + err.message);
          if (btn) btn.classList.remove('hidden');
          if (spinner) spinner.classList.add('hidden');
          $('gateway-title').textContent = "自動ログインに失敗しました";
          if (subtitle) subtitle.textContent = "手動で起動してください。";
          $('screen-gateway').classList.remove('hidden');
          $('loading').classList.add('hidden');
        }
      } else {
        // LINEログイン処理中（OAuthコールバックのパラメータがある）なら、手動ログイン画面を出さずに待機する
        const urlParams = new URLSearchParams(window.location.search);
        const isProcessing = urlParams.has('code') || urlParams.has('liff.state');
        if (isProcessing) {
          logDebug("LINE login is processing in background, skip showing manual gateway.");
          return;
        }

        logDebug("Not logged in.");
        if (liff.isInClient()) {
          logDebug("In LINE client. Redirecting to LINE Login automatically...");
          liff.login();
        } else {
          logDebug("In external browser. Showing manual login button.");
          if (btn) {
            btn.textContent = "LINEでログイン";
            btn.onclick = () => {
              logDebug("Manual login button clicked. Redirecting...");
              liff.login();
            };
            btn.classList.remove('hidden');
          }
          if (spinner) spinner.classList.add('hidden');
          if (subtitle) subtitle.textContent = "ブラウザ環境です。「LINEでログイン」ボタンを押してください。";
          $('screen-gateway').classList.remove('hidden');
          $('loading').classList.add('hidden');
        }
      }
    } catch (err) {
      console.error("LIFF Init Error:", err);
      logDebug("LIFF Error: " + err.message);
      if (btn) btn.classList.remove('hidden');
      if (spinner) spinner.classList.add('hidden');
      $('gateway-title').textContent = "自動ログインに失敗しました";
      if (subtitle) subtitle.textContent = "手動で起動してください。";
      $('screen-gateway').classList.remove('hidden');
      $('loading').classList.add('hidden');
    }
  } else {
    logDebug("Running in standalone web browser. Showing manual launch button.");
    if (btn) btn.classList.remove('hidden');
    if (spinner) spinner.classList.add('hidden');
    $('gateway-title').textContent = "ブラウザ起動";
    if (subtitle) subtitle.textContent = "手動で起動します。";
    $('screen-gateway').classList.remove('hidden');
    $('loading').classList.add('hidden');
  }
}

// -------------------------------------------------------------
// ジャイロセンサー連動 IDカード外枠エフェクト & フォールバック
// -------------------------------------------------------------
let gyroAutoInterval = null;
let gyroListenerActive = false;

function setupGyroEffect() {
  const card = document.getElementById('id-gyro-card');
  if (!card) return;

  // 既存のインターバルがあればクリア
  if (gyroAutoInterval) {
    clearInterval(gyroAutoInterval);
    gyroAutoInterval = null;
  }

  // 自動揺らぎ（ジャイロなし環境用フォールバック）
  let autoAngle = 0;
  gyroAutoInterval = setInterval(() => {
    const activeCard = document.getElementById('id-gyro-card');
    if (!activeCard) {
      clearInterval(gyroAutoInterval);
      gyroAutoInterval = null;
      return;
    }
    autoAngle += 0.5;
    const x = Math.sin(autoAngle * Math.PI / 180) * 8;
    const y = Math.cos(autoAngle * Math.PI / 180) * 4;
    activeCard.style.setProperty('--glow-x', `${x}px`);
    activeCard.style.setProperty('--glow-y', `${y}px`);
    activeCard.style.setProperty('--edge-angle', `${(autoAngle % 360) + 90}deg`);
    activeCard.style.setProperty('--glow-opacity', '0.1');
    activeCard.style.setProperty('--edge-opacity', '0.1');
  }, 30);

  // iOS/Android ジャイロセンサー連動用のハンドラー
  window.handleGyroOrientation = (event) => {
    const gyroCard = document.getElementById('id-gyro-card');
    if (!gyroCard) return;
    const gamma = Math.max(-30, Math.min(30, event.gamma || 0)); // 左右傾き -30~30
    const beta  = Math.max(-20, Math.min(20, (event.beta || 0) - 45)); // 前後傾き
    const glowX = (gamma / 30) * 16;
    const glowY = (beta  / 20) * 10;
    const edgeAngle = 180 + (gamma / 30) * 60;
    const glowOpacity = 0.06 + Math.abs(gamma / 30) * 0.18;
    const edgeOpacity = 0.08 + Math.abs(gamma / 30) * 0.22;

    gyroCard.style.setProperty('--glow-x', `${glowX}px`);
    gyroCard.style.setProperty('--glow-y', `${glowY}px`);
    gyroCard.style.setProperty('--edge-angle', `${edgeAngle}deg`);
    gyroCard.style.setProperty('--glow-opacity', glowOpacity.toFixed(3));
    gyroCard.style.setProperty('--edge-opacity', edgeOpacity.toFixed(3));
  };

  // すでに登録されている場合は二重登録しない
  if (gyroListenerActive) {
    if (typeof DeviceOrientationEvent !== 'undefined') {
      if (typeof DeviceOrientationEvent.requestPermission !== 'function') {
        clearInterval(gyroAutoInterval);
        gyroAutoInterval = null;
      }
    }
  }

  // 許可不要デバイス（Android等）または既に許可済みのiOSでイベントが取れるか確認
  if (typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission !== 'function') {
    // Android等は許可不要で即登録可能
    clearInterval(gyroAutoInterval);
    gyroAutoInterval = null;
    window.removeEventListener('deviceorientation', window.handleGyroOrientation, true);
    window.addEventListener('deviceorientation', window.handleGyroOrientation, true);
    gyroListenerActive = true;
  } else if (typeof DeviceOrientationEvent !== 'undefined' &&
             typeof DeviceOrientationEvent.requestPermission === 'function') {
    // iOS 13+ は明示的許可が必要（初回レンダリング時は非同期で自動トライしてみるが、
    // ジェスチャー以外での呼び出しは通常拒否されるため、catchされて自動揺らぎが継続する）
    DeviceOrientationEvent.requestPermission()
      .then(permissionState => {
        if (permissionState === 'granted') {
          if (gyroAutoInterval) {
            clearInterval(gyroAutoInterval);
            gyroAutoInterval = null;
          }
          window.removeEventListener('deviceorientation', window.handleGyroOrientation, true);
          window.addEventListener('deviceorientation', window.handleGyroOrientation, true);
          gyroListenerActive = true;
        }
      }).catch(() => {
        // 拒否された場合やジェスチャーエラーの場合は自動揺らぎがそのまま継続
      });
  }
}

// ユーザーがカードをタップした際に明示的にパーミッションを要求する関数
function requestGyroPermission() {
  if (typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission()
      .then(permissionState => {
        if (permissionState === 'granted') {
          if (gyroAutoInterval) {
            clearInterval(gyroAutoInterval);
            gyroAutoInterval = null;
          }
          window.removeEventListener('deviceorientation', window.handleGyroOrientation, true);
          window.addEventListener('deviceorientation', window.handleGyroOrientation, true);
          gyroListenerActive = true;
          logDebug("Gyro permission granted by user tap.");
        } else {
          logDebug("Gyro permission denied by user tap.");
        }
      })
      .catch(err => {
        logDebug("Gyro permission request failed: " + err);
      });
  }
}

// スクリプトがHTML最下部にあるため、イベントを待たず即時実行してタイミング問題を回避
safeInitApp();

