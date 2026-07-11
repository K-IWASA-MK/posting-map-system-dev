const API_URL = "https://script.google.com/macros/s/AKfycbwgiOFU5iudUS6UscNU-MZhnxZJaqJHywVA9ivA-GE0uLe02fi7mmBU474lWa1TD7-R/exec";

// Parse workspaceId and yearMonth from URL params or default
const urlParams = new URLSearchParams(window.location.search);
const workspaceId = urlParams.get('workspaceId') || 'WS-MIE-03';
const yearMonth = urlParams.get('yearMonth') || '';

let googleUser = JSON.parse(localStorage.getItem('google_user')) || null;
let activeTab = 'home';
let dashboardData = null;

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
  const tabs = ['home', 'holding', 'activity', 'email-template', 'settings'];
  tabs.forEach(t => {
    const btn = document.getElementById(`nav-${t}`);
    const content = document.getElementById(`tab-content-${t}`);
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

  // KPIs (Terms sanitized)
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

  // 1. Render Flyer Holding Status Table (No home/address info, only ID, name, city, count)
  const holdingTableBody = document.getElementById('holding-list-table-body');
  holdingTableBody.innerHTML = '';
  if (data.members && data.members.length > 0) {
    data.members.forEach(m => {
      const row = document.createElement('tr');
      row.className = 'border-b border-default text-xs';
      row.innerHTML = `
        <td class="py-3 px-4 font-mono font-bold">${m.staffNo}</td>
        <td class="py-3 px-4 font-bold">${m.displayName}</td>
        <td class="py-3 px-4 text-secondary">${m.cityName || '-'}</td>
        <td class="py-3 px-4 text-right font-extrabold text-primary">${(m.holdingQuantity || 0).toLocaleString()}枚</td>
      `;
      holdingTableBody.appendChild(row);
    });
  } else {
    holdingTableBody.innerHTML = `
      <tr>
        <td colspan="4" class="py-4 text-center text-secondary text-xs">登録されている党員さん・サポーターさんがいません</td>
      </tr>
    `;
  }

  // 2. Render Activity Trend chart
  const chartContainer = document.getElementById('monthly-trend-chart');
  chartContainer.innerHTML = '';
  if (data.monthlyTrend && data.monthlyTrend.length > 0) {
    const maxVal = Math.max(...data.monthlyTrend.map(t => t.quantity), 1);
    data.monthlyTrend.forEach(t => {
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

  // 3. Render New Members list (Term sanitized to "新規の党員さん・サポーターさん")
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
          <p class="text-[9px] text-secondary uppercase tracking-widest">チラシ保有数</p>
        </div>
      `;
      newMembersContainer.appendChild(item);
    });
  } else {
    newMembersContainer.innerHTML = '<p class="text-sm text-secondary py-2">今月の新規登録はありません</p>';
  }

  // 4. Render Ranking list (Term sanitized to "ポスティング活動実績")
  const rankingContainer = document.getElementById('ranking-list');
  rankingContainer.innerHTML = '';
  if (data.members && data.members.length > 0) {
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
          <p class="text-[9px] text-secondary tracking-widest uppercase">今月のポスティング実績</p>
        </div>
      `;
      rankingContainer.appendChild(item);
    });
  } else {
    rankingContainer.innerHTML = '<p class="text-sm text-secondary py-2">活動ログがありません</p>';
  }

  // 5. Render Invitation Email Template body preview with resolved placeholders
  const templateBodyRaw = `党員さん、サポーターさんへ

ポスティング活動へのご協力のお願いです。

{{workspaceName}}では、
地域で協力してポスティング活動を進めるため、
POSTING MAPを導入しました。

また、チラシを保管してご協力いただける方は、
{{workspaceName}}までご連絡ください。

POSTING MAPでは、

「どこで」
「誰が」
  「何枚持っているか」

を支部内で共有し、
協力しながらポスティング活動を進めることができます。

以下のLINE URLから登録をお願いします。

▼POSTING MAP参加入口

{{lineAppUrl}}

登録後、POSTING MAPを利用して
ポスティング活動に参加できます。

皆さんで協力して、
地域で継続できるポスティング活動を作っていきましょう。

{{workspaceName}}`;

  const templateBodyResolved = templateBodyRaw
    .replace(/\{\{workspaceName\}\}/g, branchName)
    .replace(/\{\{lineAppUrl\}\}/g, data.lineAppUrl || 'https://liff.line.me/...');

  document.getElementById('email-template-body-preview').textContent = templateBodyResolved;

  // 6. Settings tab values
  document.getElementById('settings-workspace-name').textContent = branchName;
  document.getElementById('settings-workspace-id').textContent = data.workspaceId || workspaceId;
  document.getElementById('settings-subscription-status').textContent = 'ACTIVE';
  document.getElementById('settings-login-email').textContent = googleUser ? googleUser.email : '-';
}

function launchEmailClient() {
  if (!dashboardData) return;
  const subject = "ポスティング活動に参加のお願い";
  const body = document.getElementById('email-template-body-preview').textContent;
  
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoUrl;
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
