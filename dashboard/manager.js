const API_URL = "https://script.google.com/macros/s/AKfycbwgiOFU5iudUS6UscNU-MZhnxZJaqJHywVA9ivA-GE0uLe02fi7mmBU474lWa1TD7-R/exec";

// Parse workspaceId and yearMonth from URL params or default
const urlParams = new URLSearchParams(window.location.search);
const workspaceId = urlParams.get('workspaceId') || 'WS-MIE-03';
const yearMonth = urlParams.get('yearMonth') || '';

let googleUser = JSON.parse(localStorage.getItem('google_user')) || null;

async function checkAuth() {
  showLoading(true);
  
  // Set Auth display label
  document.getElementById('auth-workspace-name').textContent = `${workspaceId} ダッシュボード`;

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
  // Simulate Google OAuth flow by setting a dummy user for the demo client side
  const email = prompt("Googleアカウントのメールアドレスを入力してください:", "manager@mie.example.com");
  if (email && email.includes('@')) {
    googleUser = { email: email, name: email.split('@')[0] };
    localStorage.setItem('google_user', JSON.stringify(googleUser));
    checkAuth();
  } else {
    alert("有効なメールアドレスを入力してください。");
  }
}

function renderDashboard(data) {
  document.getElementById('title-workspace-name').textContent = data.name || workspaceId;
  
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
  document.getElementById('kpi-monthly-activity').textContent = `${(data.monthlyActivity || 0).toLocaleString()}枚`;
  document.getElementById('kpi-prev-month').textContent = `先月: ${(data.previousMonthActivity || 0).toLocaleString()}枚`;
  
  // Growth rate coloring
  const growthRateEl = document.getElementById('kpi-growth-rate');
  growthRateEl.textContent = data.growthRate || '0%';
  if (data.growthRate && data.growthRate.startsWith('-')) {
    growthRateEl.className = 'font-extrabold text-red-400';
  } else {
    growthRateEl.className = 'font-extrabold text-emerald-400';
  }

  // Render 6-month chart
  const chartContainer = document.getElementById('monthly-trend-chart');
  chartContainer.innerHTML = '';
  if (data.monthlyTrend && data.monthlyTrend.length > 0) {
    const maxVal = Math.max(...data.monthlyTrend.map(t => t.quantity), 1);
    data.monthlyTrend.forEach(t => {
      // Calculate height in px (max 90px height for the bar)
      const barHeight = Math.max(Math.round((t.quantity / maxVal) * 90), 4);
      const barWrapper = document.createElement('div');
      barWrapper.className = 'flex flex-col items-center flex-1 group';
      barWrapper.innerHTML = `
        <span class="text-[9px] font-bold text-secondary mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">${t.quantity.toLocaleString()}枚</span>
        <div class="w-8 bg-primary/20 hover:bg-primary/80 border border-primary/40 rounded-t transition-all duration-300" style="height: ${barHeight}px;"></div>
        <span class="text-[10px] font-bold text-secondary mt-2">${t.month}</span>
      `;
      chartContainer.appendChild(barWrapper);
    });
  } else {
    chartContainer.innerHTML = '<p class="text-sm text-secondary py-2 w-full text-center">推移データがありません</p>';
  }

  // Render new members with registration, first activity, and holding
  const newMembersContainer = document.getElementById('new-members-list');
  newMembersContainer.innerHTML = '';
  if (data.newMembers && data.newMembers.length > 0) {
    data.newMembers.forEach(m => {
      const item = document.createElement('div');
      item.className = 'py-4 flex justify-between items-center text-sm border-b border-default';
      item.innerHTML = `
        <div>
          <p class="font-bold">${m.displayName}</p>
          <div class="flex gap-4 text-xs text-secondary mt-1">
            <span>登録: ${m.registeredAt}</span>
            <span>初活動: ${m.firstActivityDate}</span>
          </div>
        </div>
        <div class="text-right">
          <p class="font-extrabold text-primary">${m.holdingQuantity.toLocaleString()}枚</p>
          <p class="text-[9px] text-secondary uppercase tracking-widest">現在保有数</p>
        </div>
      `;
      newMembersContainer.appendChild(item);
    });
  } else {
    newMembersContainer.innerHTML = '<p class="text-sm text-secondary py-2">今月の新規参加者はいません</p>';
  }

  // Render ranking list
  const rankingContainer = document.getElementById('ranking-list');
  rankingContainer.innerHTML = '';
  if (data.members && data.members.length > 0) {
    // Sort ranking strictly by monthlyDistributionQuantity descending (criteria is distribution volume)
    const sortedMembers = [...data.members].sort((a,b) => b.monthlyDistributionQuantity - a.monthlyDistributionQuantity);
    sortedMembers.forEach((m, idx) => {
      const item = document.createElement('div');
      item.className = 'py-4 flex justify-between items-center text-sm border-b border-default';
      
      let rankBadge = `${idx + 1}`;
      if (idx === 0) rankBadge = '🥇';
      else if (idx === 1) rankBadge = '🥈';
      else if (idx === 2) rankBadge = '🥉';

      item.innerHTML = `
        <div class="flex items-center gap-4">
          <span class="text-lg font-black w-8 text-center">${rankBadge}</span>
          <div>
            <p class="font-bold">${m.displayName}</p>
            <div class="flex gap-3 text-[10px] text-secondary mt-0.5">
              <span>活動日: ${m.activityDays}日</span>
              <span class="text-primary font-bold">Index: ${m.activityIndex}</span>
            </div>
          </div>
        </div>
        <div class="text-right">
          <p class="font-extrabold">${m.monthlyDistributionQuantity.toLocaleString()}枚</p>
          <p class="text-[9px] text-secondary tracking-widest uppercase">今月の配布実績</p>
        </div>
      `;
      rankingContainer.appendChild(item);
    });
  } else {
    rankingContainer.innerHTML = '<p class="text-sm text-secondary py-2">配布活動ログがありません</p>';
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
