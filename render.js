function renderAreas() {
  if (!areaSummary || areaSummary.length === 0) {
    $('area-list').innerHTML = '<p class="text-center text-gray-500 py-20 font-bold">データがありません。<br>一括作成を実行してください。</p>';
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
        <div class="text-[9px] font-bold text-gray-500 mt-1 uppercase tracking-widest">${s.progress}% Completed</div>
      </div>
      <span class="text-gray-600 text-xl font-light">›</span>
    </div>`;
  }).join('');
}

async function openDetail(name) {
  $('loading').classList.remove('hidden');
  $('loading').classList.remove('opacity-0');
  
  await new Promise(r => setTimeout(r, 50));
  
  try {
    const data = await callApi('getAreaDetails', { name: name });
    if (data && data.points) {
      $('detail-title').textContent = name;
      $('detail-list').innerHTML = data.points.map((p, i) => `
        <div class="premium-glass p-8 space-y-6">
          <div class="flex justify-between items-start gap-4">
            <div class="text-lg font-black text-white tracking-tight leading-tight">${p.address}</div>
            <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.address)}" target="_blank" class="w-14 h-14 premium-glass-btn flex items-center justify-center text-xl">📍</a>
          </div>
          <div class="flex flex-col gap-6">
            <label style="${p.isDone ? 'background: rgba(16,185,129,0.05); border: 1px solid rgba(16,185,129,0.2);' : 'background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.05);'}" class="rounded-3xl p-5 flex items-center gap-5 cursor-pointer active:scale-[0.98] transition-all">
              <input type="checkbox" class="hidden" ${p.isDone?'checked':''} onchange="updateRecord('${name}',${p.rowId},'done',this.checked)">
              <div style="${p.isDone ? 'border-color: #10b981; background-color: #10b981; box-shadow: 0 0 10px rgba(16,185,129,0.4);' : 'border-color: rgba(255,255,255,0.2); background-color: transparent;'}" class="w-8 h-8 rounded-xl border flex items-center justify-center transition-all">
                ${p.isDone ? '<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="4" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>' : ''}
              </div>
              <span class="text-[10px] font-black uppercase tracking-widest ${p.isDone ? 'text-[#10b981]' : 'text-white/60'}">${p.isDone?'MISSION COMPLETED':'READY TO DEPLOY'}</span>
            </label>
          </div>
        </div>`).join('');
      switchPage('detail');
    }
  } catch (e) {
    alert("詳細データの取得に失敗しました。");
  }
  
  $('loading').classList.add('opacity-0');
  setTimeout(() => $('loading').classList.add('hidden'), 700);
}

function renderSettings() {
  const userInfo = JSON.parse(localStorage.getItem('user_info'));
  const container = $('settings-content');
  
  if (!userInfo) {
    // Card 1: Registration (Absolute alignment with Splash Model)
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center -mt-10 pb-12 px-4">
        <div class="mb-8 text-center">
          <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            <span class="font-black">お名前を登録して</span><br>
            <span class="font-medium">ください</span>
          </p>
        </div>
        <div class="w-full premium-glass p-8 space-y-8 text-left">
          <div class="space-y-4">
            <div>
              <label style="color: rgba(255,255,255,0.72);" class="text-[11px] font-black uppercase tracking-[0.2em] mb-2 block text-center">苗字</label>
              <input type="text" id="user-last" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); color: #ffffff;" class="w-full rounded-2xl py-6 px-7 text-lg font-black text-left outline-none focus:border-[#2563eb] transition-all shadow-xl" placeholder="例：鈴木">
            </div>
            <div>
              <label style="color: rgba(255,255,255,0.72);" class="text-[11px] font-black uppercase tracking-[0.2em] mb-2 block text-center">名前</label>
              <input type="text" id="user-first" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); color: #ffffff;" class="w-full rounded-2xl py-6 px-7 text-lg font-black text-left outline-none focus:border-[#2563eb] transition-all shadow-xl" placeholder="例：一郎">
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
    container.innerHTML = `
      <div class="py-10 px-4 flex flex-col items-center">
        <div class="mb-16 text-center">
          <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
            <span class="font-black">配布員証</span><br>
            <span class="font-medium">公式配布員 IDカード</span>
          </p>
          ${userInfo.id ? `<div class="text-xl font-black text-[#2563eb] tracking-[0.4em] font-mono pl-2">${userInfo.id}</div>` : ''}
        </div>
        
        <div class="w-full h-[220px] premium-glass flex flex-col items-center justify-center">
          <div class="inline-flex items-center gap-2 mb-4">
            <span class="w-2 h-2 bg-[#22c55e] rounded-full shadow-[0_0_8px_#22c55e]"></span>
            <span class="text-[8px] font-black text-[#22c55e] uppercase tracking-[0.3em]">Authorized Staff</span>
          </div>
          
          <div style="font-size: 44px; font-weight: 900; color: #ffffff; text-align: center; letter-spacing: 0.05em; line-height: 1.1;" class="flex flex-col items-center mb-4">
            <div>${userInfo.last}</div>
            <div>${userInfo.first}</div>
          </div>
          
          <p class="text-[8px] font-black text-gray-500 uppercase tracking-[0.3em]">Field Operations</p>
        </div>
        
        <div class="w-full mt-20 pb-8">
          <button onclick="switchPage('areas')" class="btn-neu w-full bg-[#2563eb] text-white rounded-[1.8rem] py-7 text-xl font-black shadow-xl">業務を開始する</button>
        </div>
      </div>
    `;
  }
}
