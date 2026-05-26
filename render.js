function getCityName(areaName) {
  if (!areaName) return 'その他';
  if (areaName.startsWith('四日市')) return '四日市市';
  if (areaName.startsWith('鈴鹿')) return '鈴鹿市';
  if (areaName.startsWith('亀山')) return '亀山市';
  if (areaName.startsWith('菰野')) return '菰野町';
  const match = areaName.match(/^[^市町\(\d]+(?:市|町)/);
  if (match) return match[0];
  return areaName + '市';
}

function renderAreas() {
  if (!areaSummary || areaSummary.length === 0) {
    $('area-list').innerHTML = '<p class="text-center text-white/40 py-20 font-bold">データがありません。<br>一括作成を実行してください。</p>';
    return;
  }

  if (currentCity === null) {
    // 【第1層：市・自治体一覧画面】
    const cityMap = {};
    areaSummary.forEach(s => {
      const cityName = getCityName(s.name);
      if (!cityMap[cityName]) {
        cityMap[cityName] = { name: cityName, done: 0, total: 0 };
      }
      cityMap[cityName].done += s.done || 0;
      cityMap[cityName].total += s.total || 0;
    });

    const cities = Object.values(cityMap).map(c => {
      c.progress = c.total > 0 ? Math.round((c.done / c.total) * 100) : 0;
      return c;
    });

    $('area-list').innerHTML = cities.map(c => {
      let dotStyle = '';
      if (c.progress >= 100) {
        dotStyle = 'background-color: #10b981; box-shadow: 0 0 12px rgba(16, 185, 129, 0.6);';
      } else if (c.progress > 0) {
        dotStyle = 'background-color: #2563eb; box-shadow: 0 0 12px rgba(37, 99, 235, 0.6);';
      } else {
        dotStyle = 'background-color: rgba(255, 255, 255, 0.2);';
      }
      return `
      <div class="clickable-card premium-glass p-6 flex flex-col items-center justify-center text-center gap-2" onclick="selectCity('${c.name}')">
        <div style="${dotStyle}" class="w-2.5 h-2.5 rounded-full mb-1"></div>
        <div class="text-lg font-black text-white tracking-tight">${c.name}</div>
        <div class="text-[9px] font-bold text-white/40 uppercase tracking-widest">${c.progress}% Completed <span class="text-white/20 font-medium">(${c.done}/${c.total})</span></div>
      </div>`;
    }).join('');
  } else {
    // 【第2層：選択された市のエリアシート一覧画面】
    const filteredAreas = areaSummary.filter(s => getCityName(s.name) === currentCity);

    const backButtonHtml = `
      <div class="flex items-center gap-4 mb-6">
        <button onclick="backToCityList()" class="w-12 h-12 premium-glass-btn flex items-center justify-center text-xl font-bold">‹</button>
        <span class="text-sm font-black text-white/60 tracking-wider">${currentCity} エリアシート</span>
      </div>
    `;

    const areaCardsHtml = filteredAreas.map(s => {
      let dotStyle = '';
      if (s.progress >= 100) {
        dotStyle = 'background-color: #10b981; box-shadow: 0 0 12px rgba(16, 185, 129, 0.6);';
      } else if (s.progress > 0) {
        dotStyle = 'background-color: #2563eb; box-shadow: 0 0 12px rgba(37, 99, 235, 0.6);';
      } else {
        dotStyle = 'background-color: rgba(255, 255, 255, 0.2);';
      }
      return `
      <div class="clickable-card premium-glass p-6 flex flex-col items-center justify-center text-center gap-2" onclick="openDetail('${s.name}')">
        <div style="${dotStyle}" class="w-2.5 h-2.5 rounded-full mb-1"></div>
        <div class="text-lg font-black text-white tracking-tight">${s.name}</div>
        <div class="text-[9px] font-bold text-white/40 uppercase tracking-widest">${s.progress}% Completed <span class="text-white/20 font-medium">(${s.done || 0}/${s.total || 0})</span></div>
      </div>`;
    }).join('');

    $('area-list').innerHTML = backButtonHtml + `<div class="space-y-6">${areaCardsHtml}</div>`;
  }
}

function selectCity(cityName) {
  currentCity = cityName;
  renderAreas();
  const contentEl = $('content');
  if (contentEl) contentEl.scrollTop = 0;
}

function backToCityList() {
  currentCity = null;
  renderAreas();
  const contentEl = $('content');
  if (contentEl) contentEl.scrollTop = 0;
}

// Render single card contents
function renderPointCardHtml(areaName, p) {
  return `
    <div class="flex justify-between items-start gap-4">
      <div class="flex-1 space-y-2">
        <div class="text-lg font-black text-white tracking-tight leading-tight">${p.address}</div>
        ${p.memo ? `<div class="text-xs text-white/50 bg-white/5 rounded-xl p-3 border border-white/5">${p.memo}</div>` : ''}
      </div>
      <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.address)}" target="_blank" class="w-14 h-14 premium-glass-btn flex items-center justify-center text-xl shrink-0">📍</a>
    </div>
    
    <div class="flex flex-col gap-4">
      <label style="${p.isDone ? 'background: rgba(16,185,129,0.05); border: 1px solid rgba(16,185,129,0.2);' : 'background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.05);'}" class="rounded-3xl p-5 flex items-center gap-5 cursor-pointer active:scale-[0.98] transition-all">
        <input type="checkbox" class="hidden" ${p.isDone?'checked':''} onchange="toggleDone('${areaName}', ${p.rowId}, this)">
        <div style="${p.isDone ? 'border-color: #10b981; background-color: #10b981; box-shadow: 0 0 10px rgba(16,185,129,0.4);' : 'border-color: rgba(255,255,255,0.2); background-color: transparent;'}" class="w-8 h-8 rounded-xl border flex items-center justify-center transition-all shrink-0">
          ${p.isDone ? '<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="4" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>' : ''}
        </div>
        <div class="flex-1 min-w-0">
          <span class="text-[10px] font-black uppercase tracking-widest ${p.isDone ? 'text-[#10b981]' : 'text-white/60'}">${p.isDone?'MISSION COMPLETED':'READY TO DEPLOY'}</span>
          ${p.isDone && p.completedAt ? `
            <div class="text-[10px] text-white/40 font-bold mt-0.5 tracking-wider uppercase">${p.completedAt} ${p.staffName ? `· ${p.staffName}` : ''}</div>
          ` : ''}
        </div>
      </label>

      ${p.isDone ? `
        <div class="flex justify-between items-center bg-white/5 border border-white/5 rounded-2xl p-5">
          <div class="flex items-baseline">
            <span class="text-3xl font-black text-white tracking-tight">${p.count || 0}</span>
            <span class="text-xs font-bold text-white/60 ml-1">枚</span>
          </div>
          <button onclick="openNumpad('${areaName}', ${p.rowId}, ${p.count || 0})" class="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white/80 active:scale-95 transition-all">枚数変更</button>
        </div>
      ` : ''}
    </div>
  `;
}

// Render the entire details list using global allPoints
function renderDetailList(areaName) {
  $('detail-list').innerHTML = allPoints.map((p, i) => `
    <div id="point-card-${p.rowId}" class="premium-glass p-8 space-y-6">
      ${renderPointCardHtml(areaName, p)}
    </div>`).join('');
}

async function openDetail(name) {
  $('loading').classList.remove('hidden');
  $('loading').classList.remove('opacity-0');
  
  await new Promise(r => setTimeout(r, 50));
  
  try {
    const data = await callApi('getAreaDetails', { name: name });
    if (data && data.points) {
      $('detail-title').textContent = name;
      allPoints = data.points;
      renderDetailList(name);
      
      // 新しい地区を開くため、詳細画面のスクロール位置をキャッシュからクリア
      if (typeof scrollPositions !== 'undefined') {
        scrollPositions['detail'] = 0;
      }
      
      switchPage('detail');
    }
  } catch (e) {
    alert("詳細データの取得に失敗しました。");
  }
  
  $('loading').classList.add('opacity-0');
  setTimeout(() => $('loading').classList.add('hidden'), 700);
}

function toggleDone(areaName, rowId, checkbox) {
  const p = allPoints.find(point => point.rowId === rowId);
  if (!p) return;
  
  if (checkbox.checked) {
    // Open numpad modal
    openNumpad(areaName, rowId, p.count || 0, true, checkbox);
  } else {
    // Directly clear completion and count
    p.isDone = false;
    p.count = 0;
    p.completedAt = '';
    p.staffName = '';
    
    // Update local card
    const card = $(`point-card-${rowId}`);
    if (card) {
      card.innerHTML = renderPointCardHtml(areaName, p);
    }
    
    // Send update to server
    updateRecord(areaName, rowId, false, 0);
  }
}

function renderSettings() {
  const userInfo = JSON.parse(localStorage.getItem('user_info'));
  const container = $('settings-content');
  
  if (!userInfo) {
    // Card 1: Registration (Absolute alignment with Splash Model)
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center -mt-10 pb-12 px-4">
        <div class="mb-8 text-center">
          <p class="text-sm text-white/70 leading-relaxed">
            <span class="font-black">お名前を登録して</span><br>
            <span class="font-medium">ください</span>
          </p>
        </div>
        <div class="w-full premium-glass p-8 space-y-8 text-left">
          <div class="space-y-4">
            <div>
              <label style="color: rgba(255,255,255,0.72);" class="text-[11px] font-black uppercase tracking-[0.2em] mb-2 block text-center">苗字</label>
              <input type="text" id="user-last" style="background: #ffffff; border: 1px solid rgba(0, 0, 0, 0.15); color: #000000;" class="w-full rounded-2xl py-6 px-7 text-lg font-black text-left outline-none focus:border-[#2563eb] transition-all shadow-xl placeholder-gray-400" placeholder="例：鈴木">
            </div>
            <div>
              <label style="color: rgba(255,255,255,0.72);" class="text-[11px] font-black uppercase tracking-[0.2em] mb-2 block text-center">名前</label>
              <input type="text" id="user-first" style="background: #ffffff; border: 1px solid rgba(0, 0, 0, 0.15); color: #000000;" class="w-full rounded-2xl py-6 px-7 text-lg font-black text-left outline-none focus:border-[#2563eb] transition-all shadow-xl placeholder-gray-400" placeholder="例：一郎">
            </div>
          </div>
          
          <div class="pt-2">
            <button onclick="saveProfile()" class="btn-neu w-full bg-[#2563eb] text-white rounded-2xl py-6 text-lg font-black shadow-xl transition-all">登録を完了する</button>
          </div>
        </div>
      </div>
    `;
  } else {
    // Card 2: Distributor ID Card (Standardized to Splash Model)
    const avatarHtml = userInfo.picture ? `
      <div class="w-24 h-24 rounded-full overflow-hidden border-2 border-white/20 shadow-2xl mb-4 relative z-10">
        <img src="${userInfo.picture}" class="w-full h-full object-cover">
      </div>
    ` : `
      <div class="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 relative z-10">
        <span class="text-3xl text-white/40">👤</span>
      </div>
    `;

    const formattedId = userInfo.id ? userInfo.id.replace(/^[A-Za-z]+/, 'STAFF ID ') : '';
    const rawBranch = localStorage.getItem('branch_name') || '';
    const displayBranch = rawBranch ? (rawBranch.includes('支部') ? rawBranch : `${rawBranch} 支部`) : '';

    container.innerHTML = `
      <div class="pt-2 pb-0 px-4 flex flex-col items-center">
        <div class="mb-6 flex items-center justify-center gap-3">
          <span class="text-xs font-bold text-white/50 tracking-wider">公式配布員</span>
          ${formattedId ? `<span style="letter-spacing: 0.15em; text-indent: 0.15em; background: linear-gradient(180deg, rgba(37,99,235,0.16), rgba(37,99,235,0.06)); border: 1px solid rgba(37,99,235,0.3); box-shadow: inset 0 1px 0 rgba(255,255,255,0.15), inset 0 0 6px rgba(37,99,235,0.35), 0 0 12px rgba(37,99,235,0.25); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);" class="inline-flex items-center justify-center h-6 px-3 text-[10px] font-black text-[#2563eb] font-mono rounded-full">${formattedId}</span>` : ''}
        </div>
        
        <div id="id-gyro-card" style="--glow-x: 0px; --glow-y: 0px; --glow-opacity: 0.08; --edge-opacity: 0.08; --edge-angle: 180deg;" class="w-full max-w-sm h-[300px] gyro-card flex flex-col items-center justify-between p-6 relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-b from-white/5 to-white/0 pointer-events-none rounded-[28px]"></div>
          
          <div class="inline-flex items-center gap-2 z-10 mt-2">
            <span class="w-2 h-2 bg-[#22c55e] rounded-full shadow-[0_0_8px_#22c55e]"></span>
            <span class="text-[8px] font-black text-[#22c55e] uppercase tracking-[0.3em]">Authorized Staff</span>
          </div>
          
          <div class="flex flex-col items-center z-10 my-auto w-full max-w-[280px]">
            ${avatarHtml}
            <div style="font-size: 28px; font-weight: 900; color: #ffffff; text-align: center; letter-spacing: 0.05em; line-height: 1.1;" class="flex flex-col items-center w-full">
              <div class="truncate w-full">${userInfo.last}</div>
              <div class="text-xs text-white/40 font-medium mt-1 truncate w-full">${userInfo.first || ''}</div>
            </div>
          </div>
          
          <div class="flex flex-col items-center gap-1 z-10">
            ${displayBranch ? `<p class="text-[8px] font-black text-white/40 uppercase tracking-[0.3em]">${displayBranch}</p>` : ''}
            <p class="text-[8px] font-black text-white/40 uppercase tracking-[0.3em]">Field Operations</p>
          </div>
        </div>
      </div>
    `;
  }
}

function renderRanking() {
  const container = $('ranking-list');
  if (!container) return;

  const userInfo = JSON.parse(localStorage.getItem('user_info'));
  const myName = userInfo ? (userInfo.last + " " + (userInfo.first || "")).trim() : "";

  // 実データが無い場合の超美麗モックデータ
  const defaultRanking = [
    { name: "岩佐 健二", count: 5450 },
    { name: "鈴木 一郎", count: 4200 },
    { name: "佐藤 太一", count: 3900 },
    { name: "田中 実", count: 2100 },
    { name: "渡辺 花子", count: 1850 },
    { name: "高橋 茂", count: 1500 },
    { name: "中村 順子", count: 1200 }
  ];

  if (myName && !defaultRanking.some(r => r.name === myName)) {
    defaultRanking.push({ name: myName, count: 650 });
  }

  const displayRanking = (typeof rankingData !== 'undefined' && rankingData && rankingData.length > 0)
    ? rankingData
    : defaultRanking.sort((a, b) => b.count - a.count);

  let myRank = -1;
  if (myName) {
    myRank = displayRanking.findIndex(r => r.name === myName) + 1;
  }

  const itemsHtml = displayRanking.map((r, index) => {
    const rank = index + 1;
    const isMe = myName && r.name === myName;
    
    let cardStyle = '';
    let rankBadgeClass = '';
    let glowDotHtml = '';

    if (rank === 1) {
      cardStyle = 'border: 1px solid rgba(250, 204, 21, 0.35); box-shadow: inset 0 0 15px rgba(250, 204, 21, 0.08), 0 0 25px rgba(250, 204, 21, 0.12);';
      rankBadgeClass = 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
      glowDotHtml = '<span class="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse mr-2 shadow-[0_0_8px_#eab308]"></span>';
    } else if (rank === 2) {
      cardStyle = 'border: 1px solid rgba(226, 232, 240, 0.3); box-shadow: inset 0 0 12px rgba(226, 232, 240, 0.06), 0 0 20px rgba(226, 232, 240, 0.08);';
      rankBadgeClass = 'bg-slate-300/10 text-slate-300 border border-slate-300/20';
      glowDotHtml = '<span class="w-1.5 h-1.5 rounded-full bg-slate-300 mr-2 shadow-[0_0_6px_#cbd5e1]"></span>';
    } else if (rank === 3) {
      cardStyle = 'border: 1px solid rgba(217, 119, 6, 0.3); box-shadow: inset 0 0 12px rgba(217, 119, 6, 0.06), 0 0 20px rgba(217, 119, 6, 0.08);';
      rankBadgeClass = 'bg-amber-600/10 text-amber-500 border border-amber-600/20';
      glowDotHtml = '<span class="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 shadow-[0_0_6px_#f59e0b]"></span>';
    } else {
      cardStyle = isMe 
        ? 'border: 1px solid rgba(37, 99, 235, 0.4); box-shadow: inset 0 0 12px rgba(37, 99, 235, 0.1), 0 0 20px rgba(37, 99, 235, 0.15);' 
        : 'border: 1px solid rgba(255, 255, 255, 0.04);';
      rankBadgeClass = isMe 
        ? 'bg-[#2563eb]/20 text-[#2563eb] border border-[#2563eb]/30' 
        : 'bg-white/5 text-white/50 border border-white/5';
      glowDotHtml = isMe 
        ? '<span class="w-1.5 h-1.5 rounded-full bg-[#2563eb] animate-pulse mr-2 shadow-[0_0_8px_#2563eb]"></span>' 
        : '';
    }

    return `
      <div style="${cardStyle}" class="premium-glass p-6 flex items-center justify-between transition-all">
        <div class="flex items-center">
          <div class="h-8 px-3 rounded-full flex items-center justify-center font-mono font-black text-xs ${rankBadgeClass} mr-4">
            ${glowDotHtml}
            ${rank}位
          </div>
          <div class="flex flex-col">
            <span class="text-sm font-black ${isMe ? 'text-white' : 'text-white/80'}">${r.name}${isMe ? '<span class="text-[9px] font-black uppercase text-[#2563eb] tracking-widest ml-2 bg-[#2563eb]/10 px-2 py-0.5 rounded-full">YOU</span>' : ''}</span>
          </div>
        </div>
        <div class="flex items-baseline">
          <span class="text-xl font-black text-white tracking-tight">${r.count.toLocaleString()}</span>
          <span class="text-[9px] font-bold text-white/40 ml-1">枚</span>
        </div>
      </div>
    `;
  }).join('');

  const myStatusCardHtml = myRank > 0 ? `
    <div style="border: 1px solid rgba(37, 99, 235, 0.25); box-shadow: inset 0 0 15px rgba(37, 99, 235, 0.05), 0 0 25px rgba(37, 99, 235, 0.08);" class="premium-glass p-6 flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-[#2563eb]/10 border border-[#2563eb]/20 flex items-center justify-center text-xl shadow-lg shadow-[#2563eb]/10">🏆</div>
        <div>
          <p class="text-[9px] font-black text-[#2563eb] uppercase tracking-widest">My Performance</p>
          <h4 class="text-sm font-black text-white tracking-tight mt-0.5">${myName}</h4>
        </div>
      </div>
      <div class="text-right">
        <p class="text-[9px] font-black text-white/40 uppercase tracking-widest">現在の順位</p>
        <p class="text-2xl font-mono font-black text-white tracking-tighter mt-0.5">${myRank}<span class="text-xs text-white/50 font-bold ml-1">位</span></p>
      </div>
    </div>
  ` : '';

  container.innerHTML = myStatusCardHtml + `<div class="space-y-4">${itemsHtml}</div>`;
}
