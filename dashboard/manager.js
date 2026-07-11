const API_URL = "https://script.google.com/macros/s/AKfycbwgiOFU5iudUS6UscNU-MZhnxZJaqJHywVA9ivA-GE0uLe02fi7mmBU474lWa1TD7-R/exec";

// Parse workspaceId from URL params or default
const urlParams = new URLSearchParams(window.location.search);
const workspaceId = urlParams.get('workspaceId') || 'WS-MIE-03';

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
  const url = `${API_URL}?action=getWorkspaceDashboard&workspaceId=${workspaceId}&googleEmail=${encodeURIComponent(email)}`;
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (e) {
    return null;
  }
}

function handleGoogleLogin() {
  // Simulate Google OAuth flow by setting a dummy user for the demo client side
  // In actual production deployment, this triggers GIS (Google Identity Services) popup.
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
  document.getElementById('title-workspace-name').textContent = data.workspaceName || workspaceId;
  document.getElementById('kpi-staff-count').textContent = `${data.members ? data.members.length : 0}人`;
  document.getElementById('kpi-total-holding').textContent = `${data.totalHoldingQuantity || 0}枚`;

  // Render new members
  const newMembersContainer = document.getElementById('new-members-list');
  newMembersContainer.innerHTML = '';
  if (data.newMembers && data.newMembers.length > 0) {
    data.newMembers.forEach(m => {
      const item = document.createElement('div');
      item.className = 'py-4 flex justify-between items-center text-sm border-b border-default';
      item.innerHTML = `
        <div>
          <p class="font-bold">${m.displayName}</p>
          <p class="text-xs text-secondary">参加日: ${m.registeredAt}</p>
        </div>
        <div class="text-right">
          <p class="font-extrabold text-primary">${m.holdingQuantity}枚</p>
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
  const sortedMembers = data.members ? [...data.members].sort((a,b) => b.monthlyDistributionQuantity - a.monthlyDistributionQuantity) : [];
  
  if (sortedMembers && sortedMembers.length > 0) {
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
            <p class="text-[10px] text-secondary tracking-widest">ID: ${m.staffNo}</p>
          </div>
        </div>
        <div class="text-right">
          <p class="font-extrabold">${m.monthlyDistributionQuantity}枚</p>
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
