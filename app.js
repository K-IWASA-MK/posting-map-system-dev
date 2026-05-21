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

async function loadData() {
  try {
    const data = await callApi('getAppData');
    if (data && data.success) {
      areaSummary = data.areas;
      renderAreas();
      updateStats();
      
      const saved = localStorage.getItem('user_info');
      switchPage(saved ? 'areas' : 'settings');
      
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
  
  try {
    const result = await callApi('submitDistribution', {
      areaName: areaName,
      rowId: rowId,
      staffName: staffName,
      isDone: val,
      action: 'submitDistribution'
    });
    if (result.success) {
      loadData();
    }
  } catch (e) {
    alert("更新に失敗しました。");
  }
}

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
};
