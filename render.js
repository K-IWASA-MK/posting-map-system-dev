function renderAreas() {
  if (!areaSummary || areaSummary.length === 0) {
    $('area-list').innerHTML = '<p class="text-center text-white/40 py-20 font-bold">データがありません。<br>一括作成を実行してください。</p>';
    return;
  }
  $('area-list').innerHTML = areaSummary.map(s => {
    let dotStyle = '';
    if (s.progress >= 100) {
      dotStyle = 'background-color: #10b981; box-shadow: 0 0 12px rgba(16, 185, 129, 0.6);';
    } else if (s.progress > 0) {
      dotStyle = 'background-color: #2563eb; box-shadow: 0 0 12px rgba(37, 99, 235, 0.6);';
    } else {
      dotStyle = 'background-color: rgba(255, 255, 255, 0.2);';
    }
    return `
    <div class="clickable-card premium-glass p-8 flex items-center" onclick="openDetail('${s.name}')">
      <div style="${dotStyle}" class="w-3 h-3 rounded-full mr-6"></div>
      <div class="flex-1">
        <div class="text-lg font-black text-white tracking-tighter">${s.name}</div>
        <div class="text-[9px] font-bold text-white/40 mt-1 uppercase tracking-widest">${s.progress}% Completed <span class="text-white/20 font-medium">(${s.done || 0}/${s.total || 0})</span></div>
      </div>
      <span class="text-white/40 text-xl font-light">›</span>
    </div>`;
  }).join('');
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

    const formattedId = userInfo.id ? userInfo.id.replace(/^([A-Za-z]+)(\d+)$/, '$1 $2') : '';

    container.innerHTML = `
      <div class="min-h-[calc(100dvh-220px)] flex flex-col items-center justify-center px-4 pb-24">
        <div class="mb-6 flex items-center justify-center gap-3">
          <span class="text-xs font-bold text-white/50 tracking-wider">公式配布員 IDカード</span>
          ${formattedId ? `<span class="text-xs font-black text-[#2563eb] tracking-[0.1em] font-mono bg-[#2563eb]/10 px-3 py-1 rounded-full border border-[#2563eb]/20 pl-1">${formattedId}</span>` : ''}
        </div>
        
        <div class="w-full max-w-sm h-[300px] premium-glass flex flex-col items-center justify-between p-6 relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-b from-white/5 to-white/0 pointer-events-none rounded-[28px]"></div>
          
          <div class="inline-flex items-center gap-2 z-10">
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
          
          <p class="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] z-10">Field Operations</p>
        </div>
      </div>
    `;
  }
}
