const API_URL = "https://script.google.com/macros/s/AKfycbwgiOFU5iudUS6UscNU-MZhnxZJaqJHywVA9ivA-GE0uLe02fi7mmBU474lWa1TD7-R/exec";

// Parse workspaceId and yearMonth from URL params or default
const urlParams = new URLSearchParams(window.location.search);
const workspaceId = urlParams.get('workspaceId') || 'WS-MIE-03';
const yearMonth = urlParams.get('yearMonth') || '';

let googleUser = JSON.parse(localStorage.getItem('google_user')) || null;
let activeTab = 'home';
let dashboardData = null;

// Pagination state for facts
let currentFactPage = 1;
let currentFactLimit = 10;
let currentFactsData = null;

async function checkAuth() {
  showLoading(true);
  
  // Set Auth display label
  document.getElementById('auth-workspace-name').textContent = `${workspaceId} 支部運営システム`;

  if (!googleUser) {
    showScreen('auth-screen');
    showLoading(false);
    return;
  }

  try {
    // Attempt fetching dashboard data
    const data = await fetchDashboardData(googleUser.email);
    if (data) {
      if (data.status === 403 || (data.error && data.error.code === 'PM-SUB-001') || (data.exception && data.exception.code === 'PM-SUB-001')) {
        showScreen('suspended-screen');
      } else if (data.success === false) {
        // Auth error, fallback to login
        logout();
      } else {
        renderDashboard(data.data || data);
        showScreen('dashboard-app');
        // Initial fetch for facts and holdings
        fetchFacts();
        fetchHoldings();
      }
    } else {
      showError('データの取得に失敗しました。');
    }
  } catch (e) {
    showError('エラーが発生しました。' + e.message);
  } finally {
    showLoading(false);
  }
}

async function fetchDashboardData(email) {
  let url = `${API_URL}?action=getWorkspaceDashboard&workspaceId=${workspaceId}&googleEmail=${encodeURIComponent(email)}`;
  if (yearMonth) {
    url += `&yearMonth=${yearMonth}`;
  }
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (e) {
    return null;
  }
}

function handleGoogleLogin() {
  const email = prompt("Googleアカウントのメールアドレスを入力してください:", "manager@mie.example.com");
  if (email && email.includes('@')) {
    googleUser = { email: email, name: email.split('@')[0] };
    localStorage.setItem('google_user', JSON.stringify(googleUser));
    checkAuth();
  } else {
    alert("有効なメールアドレスを入力してください。");
  }
}

function switchTab(tabName) {
  activeTab = tabName;
  const tabs = ['home', 'holding', 'activity', 'settings'];
  tabs.forEach(t => {
    const btn = document.getElementById(`nav-${t}`);
    const content = document.getElementById(`tab-content-${t}`);
    if (!btn || !content) return;
    
    if (t === tabName) {
      btn.classList.add('bg-primary', 'text-white');
      btn.classList.remove('text-secondary', 'hover:text-white');
      content.classList.remove('hidden');
    } else {
      btn.classList.remove('bg-primary', 'text-white');
      btn.classList.add('text-secondary', 'hover:text-white');
      content.classList.add('hidden');
    }
  });
}

function renderDashboard(data) {
  dashboardData = data;
  
  // Set header branch name
  const branchName = data.name || workspaceId;
  document.getElementById('title-workspace-name').textContent = branchName;
  
  // Format period label
  let displayPeriod = '今月';
  if (yearMonth) {
    const y = yearMonth.substring(0, 4);
    const m = parseInt(yearMonth.substring(4, 6), 10);
    displayPeriod = `${y}年${m}月`;
  } else {
    const now = new Date();
    displayPeriod = `${now.getFullYear()}年${now.getMonth() + 1}月`;
  }
  document.getElementById('header-period-label').textContent = `${displayPeriod} 実績レポート`;

  // KPIs
  document.getElementById('kpi-staff-count').textContent = `${data.memberCount || 0}人`;
  document.getElementById('kpi-total-holding').textContent = `${(data.total || 0).toLocaleString()}枚`;
  document.getElementById('kpi-active-member-count').textContent = `${data.activeMemberCount || 0}人`;
  document.getElementById('kpi-monthly-activity').textContent = `${(data.monthlyActivity || 0).toLocaleString()}枚`;
  document.getElementById('kpi-prev-month').textContent = `先月: ${(data.previousMonthActivity || 0).toLocaleString()}枚`;
  
  // Growth rate
  const growthRateEl = document.getElementById('kpi-growth-rate');
  growthRateEl.textContent = data.growthRate || '0%';
  if (data.growthRate && data.growthRate.startsWith('-')) {
    growthRateEl.className = 'font-extrabold text-red-400';
  } else {
    growthRateEl.className = 'font-extrabold text-emerald-400';
  }

  // 1. Goal & Achievement
  const goalLabel = document.getElementById('analytics-goal-label');
  const achievementRateEl = document.getElementById('analytics-achievement-rate');
  const achievementSuffix = document.getElementById('analytics-achievement-suffix');
  const progressBar = document.getElementById('analytics-progress-bar');
  
  if (goalLabel && achievementRateEl && achievementSuffix && progressBar) {
    if (data.distributionGoal && data.distributionGoal > 0) {
      goalLabel.textContent = `目標: ${(data.distributionGoal).toLocaleString()}枚`;
      achievementRateEl.textContent = `${data.achievementRate || 0}%`;
      achievementSuffix.textContent = '達成';
      progressBar.style.width = `${Math.min(data.achievementRate || 0, 100)}%`;
    } else {
      goalLabel.textContent = '目標: 未設定';
      achievementRateEl.textContent = '-%';
      achievementSuffix.textContent = '';
      progressBar.style.width = '0%';
    }
  }

  // Settings tab values
  document.getElementById('settings-workspace-name').textContent = branchName;
  document.getElementById('settings-workspace-id').textContent = data.workspaceId || workspaceId;
  document.getElementById('settings-subscription-status').textContent = 'ACTIVE';
  document.getElementById('settings-login-email').textContent = googleUser ? googleUser.email : '-';

  // Goal configuration in settings
  const goalInput = document.getElementById('settings-goal-input');
  if (goalInput) {
    goalInput.value = data.distributionGoal !== undefined && data.distributionGoal !== null ? data.distributionGoal : '';
  }
}

// ==========================================
// P-05: Dashboard Editing Foundation (Facts)
// ==========================================
async function fetchFacts() {
  const dateObj = document.getElementById('fact-filter-date');
  const areaObj = document.getElementById('fact-filter-area');
  
  const dateVal = dateObj ? dateObj.value.replace(/-/g, '/') : '';
  const areaVal = areaObj ? areaObj.value : '';

  let url = `${API_URL}?action=dashboard/facts&page=${currentFactPage}&limit=${currentFactLimit}`;
  if (dateVal) url += `&date=${encodeURIComponent(dateVal)}`;
  if (areaVal) url += `&area=${encodeURIComponent(areaVal)}`;

  try {
    const res = await fetch(url);
    const json = await res.json();
    if (json.success) {
      currentFactsData = json.data;
      renderFactList(json.data);
    } else {
      console.error('Fact API Error:', json);
    }
  } catch (e) {
    console.error(e);
  }
}

function renderFactList(data) {
  const tbody = document.getElementById('fact-list-table-body');
  tbody.innerHTML = '';
  
  if (!data || !data.items || data.items.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="py-4 text-center text-secondary text-xs">データがありません</td></tr>';
    document.getElementById('fact-pagination-info').textContent = '0 件表示';
    return;
  }

  data.items.forEach(fact => {
    const row = document.createElement('tr');
    row.className = 'border-b border-default text-xs';
    row.innerHTML = `
      <td class="py-3 px-4 font-mono">${fact.date || '-'}</td>
      <td class="py-3 px-4">${fact.district || '-'}</td>
      <td class="py-3 px-4">${fact.area || '-'}</td>
      <td class="py-3 px-4 text-right font-extrabold text-primary">${(fact.distributionCount || 0).toLocaleString()}枚</td>
      <td class="py-3 px-4 text-center">
        <span class="px-2 py-0.5 rounded-full text-[9px] font-bold ${fact.syncStatus === 'SYNCED' ? 'bg-emerald-400/20 text-emerald-400' : 'bg-red-400/20 text-red-400'}">${fact.syncStatus}</span>
      </td>
      <td class="py-3 px-4 text-center">
        <button onclick="showFactDetail('${fact.id}')" class="text-xs font-bold text-secondary hover:text-white border border-default rounded px-3 py-1 hover:bg-white/5 transition-all">詳細</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  const start = (currentFactPage - 1) * currentFactLimit + 1;
  const end = start + data.items.length - 1;
  document.getElementById('fact-pagination-info').textContent = `${start} - ${end} 件 / ${data.totalCount} 件`;
}

function changeFactPage(delta) {
  if (!currentFactsData) return;
  const maxPage = Math.ceil(currentFactsData.totalCount / currentFactLimit);
  const newPage = currentFactPage + delta;
  if (newPage < 1 || newPage > maxPage) return;
  currentFactPage = newPage;
  fetchFacts();
}

async function showFactDetail(id) {
  showLoading(true);
  try {
    const res = await fetch(`${API_URL}?action=dashboard/facts/detail&id=${encodeURIComponent(id)}`);
    const json = await res.json();
    if (json.success && json.data) {
      const fact = json.data;
      document.getElementById('fact-detail-date').textContent = fact.date || '-';
      document.getElementById('fact-detail-sync').textContent = fact.syncStatus || '-';
      document.getElementById('fact-detail-district').textContent = fact.district || '-';
      document.getElementById('fact-detail-area').textContent = fact.area || '-';
      document.getElementById('fact-detail-count').textContent = `${(fact.distributionCount || 0).toLocaleString()}枚`;
      document.getElementById('fact-detail-gps').textContent = fact.gpsEvidence || 'なし';
      
      const photoContainer = document.getElementById('fact-detail-photo-container');
      if (fact.photoEvidence) {
        photoContainer.innerHTML = `<img src="${fact.photoEvidence}" class="object-cover w-full h-full" />`;
      } else {
        photoContainer.innerHTML = 'NO PHOTO';
      }

      document.getElementById('fact-detail-modal').classList.remove('hidden');
    }
  } catch (e) {
    console.error(e);
  } finally {
    showLoading(false);
  }
}

function closeFactDetailModal() {
  document.getElementById('fact-detail-modal').classList.add('hidden');
}


// ==========================================
// P-05: Dashboard Editing Foundation (Holdings)
// ==========================================
async function fetchHoldings() {
  try {
    const res = await fetch(`${API_URL}?action=dashboard/holdings`);
    const json = await res.json();
    if (json.success) {
      renderHoldingsList(json.data);
    }
  } catch (e) {
    console.error(e);
  }
}

function renderHoldingsList(holdings) {
  const tbody = document.getElementById('holding-list-table-body');
  tbody.innerHTML = '';
  
  if (!holdings || holdings.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="py-4 text-center text-secondary text-xs">登録されている保管場所がありません</td></tr>';
    return;
  }

  holdings.forEach(h => {
    const row = document.createElement('tr');
    row.className = 'border-b border-default text-xs';
    row.innerHTML = `
      <td class="py-3 px-4 font-mono font-bold">${h.keeper}</td>
      <td class="py-3 px-4 font-bold">-</td>
      <td class="py-3 px-4 text-secondary">${h.location || '-'}</td>
      <td class="py-3 px-4 text-right font-extrabold text-primary">${(h.currentHoldings || 0).toLocaleString()}枚</td>
      <td class="py-3 px-4 text-center flex justify-center gap-2">
        <button onclick="openHoldingModal('${h.keeper}', '${h.location || ''}', ${h.currentHoldings})" class="text-xs font-bold text-secondary hover:text-white border border-default rounded px-3 py-1 hover:bg-white/5 transition-all">編集</button>
        <button onclick="deleteHolding('${h.keeper}')" class="text-xs font-bold text-red-400 hover:text-red-300 border border-red-500/30 rounded px-3 py-1 hover:bg-red-500/10 transition-all">削除</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function openHoldingModal(keeper = '', location = '', count = 0) {
  const isEdit = !!keeper;
  document.getElementById('holding-modal-title').textContent = isEdit ? '保管場所 編集' : '保管場所 新規追加';
  document.getElementById('holding-mode').value = isEdit ? 'update' : 'add';
  
  const keeperInput = document.getElementById('holding-keeper-input');
  keeperInput.value = keeper;
  keeperInput.readOnly = isEdit; // Do not allow changing keeper ID during edit
  
  document.getElementById('holding-location-input').value = location;
  document.getElementById('holding-count-input').value = count;
  
  document.getElementById('holding-edit-modal').classList.remove('hidden');
}

function closeHoldingModal() {
  document.getElementById('holding-edit-modal').classList.add('hidden');
}

async function saveHolding(event) {
  event.preventDefault();
  const mode = document.getElementById('holding-mode').value;
  const keeper = document.getElementById('holding-keeper-input').value;
  const location = document.getElementById('holding-location-input').value;
  const count = Number(document.getElementById('holding-count-input').value);
  
  const payload = {
    action: mode === 'add' ? 'dashboard/holdings/add' : 'dashboard/holdings/update',
    dto: {
      holdingId: keeper,
      workspaceId: workspaceId,
      location: location,
      keeper: keeper,
      currentHoldings: count,
      updatedAt: new Date().toISOString()
    }
  };

  showLoading(true);
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (result.success) {
      closeHoldingModal();
      fetchHoldings(); // Refresh list
    } else {
      alert('保存に失敗しました: ' + (result.error || '不明なエラー'));
    }
  } catch (e) {
    alert('通信エラー: ' + e.message);
  } finally {
    showLoading(false);
  }
}

async function deleteHolding(keeper) {
  if (!confirm(`本当に保管者 ${keeper} の記録を削除しますか？`)) return;
  
  showLoading(true);
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'dashboard/holdings/delete',
        keeper: keeper
      })
    });
    const result = await res.json();
    if (result.success) {
      fetchHoldings(); // Refresh list
    } else {
      alert('削除に失敗しました: ' + (result.error || '不明なエラー'));
    }
  } catch (e) {
    alert('通信エラー: ' + e.message);
  } finally {
    showLoading(false);
  }
}


function showScreen(id) {
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('suspended-screen').classList.add('hidden');
  document.getElementById('dashboard-app').classList.add('hidden');
  document.getElementById(id).classList.remove('hidden');
}

function showLoading(show) {
  const overlay = document.getElementById('loading-overlay');
  if (show) {
    overlay.classList.remove('hidden');
    overlay.style.opacity = '1';
  } else {
    overlay.style.opacity = '0';
    setTimeout(() => overlay.classList.add('hidden'), 300);
  }
}

function logout() {
  localStorage.removeItem('google_user');
  googleUser = null;
  checkAuth();
}

function showError(msg) {
  alert(msg);
}

// Start checks
checkAuth();
