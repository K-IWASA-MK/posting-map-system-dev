// POSTING MAP Component: staff.js (Stateless, API-free rendering)
window.renderStaffCard = function(userInfo, options = {}) {
  if (!userInfo) return '';

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
  const displayBranch = options.branchName || 'MIE-03 支部';
  const lastSyncTime = options.lastSyncTime || '--:--';
  const registrationDate = userInfo.registrationDate || '2025/07/01';

  return `
    <div class="pt-2 pb-0 px-4 flex flex-col items-center">
      <div class="mb-6 flex items-center justify-center gap-3">
        <span class="text-xs font-bold text-white/50 tracking-wider">公式配布員</span>
        ${formattedId ? `<span style="letter-spacing: 0.15em; text-indent: 0.15em; background: linear-gradient(180deg, rgba(0,183,255,0.16), rgba(0,183,255,0.06)); border: 1px solid rgba(0,183,255,0.3); box-shadow: inset 0 1px 0 rgba(255,255,255,0.15), inset 0 0 6px rgba(0,183,255,0.35), 0 0 12px rgba(0,183,255,0.25); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);" class="inline-flex items-center justify-center h-6 px-3 text-[10px] font-black text-[#00B7FF] font-mono rounded-full">${formattedId}</span>` : ''}
      </div>
      
      <div id="id-gyro-card" style="height: 380px; --glow-x: 0px; --glow-y: 0px; --glow-opacity: 0.08; --edge-opacity: 0.08; --edge-angle: 180deg;" class="w-full max-w-sm gyro-card flex flex-col items-center p-6 relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-b from-white/5 to-white/0 pointer-events-none rounded-[28px]"></div>
        
        <!-- 1. 最上部 -->
        <div style="margin-top: 18px;" class="inline-flex items-center gap-2 z-10">
          <span class="w-2 h-2 bg-[#22c55e] rounded-full shadow-[0_0_8px_#22c55e]"></span>
          <span class="text-[8px] font-black text-[#22c55e] uppercase tracking-[0.3em]">Authorized Staff</span>
        </div>
        
        <!-- 2. 中央アバターと名前 -->
        <div style="position: absolute; top: 43%; left: 50%; transform: translate(-50%, -50%);" class="flex flex-col items-center z-10 w-full max-w-[280px]">
          ${avatarHtml}
          <div style="font-size: 28px; font-weight: 900; color: #ffffff; text-align: center; letter-spacing: 0.05em; line-height: 1.1;" class="flex flex-col items-center w-full">
            <div class="truncate w-full">${userInfo.last}</div>
            <div class="text-xs text-white/40 font-medium mt-1 truncate w-full">${userInfo.first || ''}</div>
          </div>
          <p class="text-[8px] font-black text-white/35 uppercase tracking-[0.25em] mt-3">${displayBranch}</p>
          <p class="text-[8px] font-black text-white/35 uppercase tracking-[0.25em] mt-0.5">Field Operations</p>
        </div>
        
        <!-- 3. 最下部 メタデータグリッド -->
        <div style="position: absolute; bottom: 16px; left: 0; width: 100%; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px;" class="grid grid-cols-3 gap-1 text-center text-[9px] text-white/40 z-10 px-4">
          <div class="flex flex-col items-center gap-1 border-r border-white/5">
            <span class="text-[8px] font-bold text-white/30 tracking-wider">🏢 所属</span>
            <span class="text-white/80 font-bold truncate max-w-full px-1">${displayBranch}</span>
          </div>
          <div class="flex flex-col items-center gap-1 border-r border-white/5">
            <span class="text-[8px] font-bold text-white/30 tracking-wider">📅 登録日</span>
            <span class="text-white/80 font-bold">${registrationDate}</span>
          </div>
          <div class="flex flex-col items-center gap-1">
            <span class="text-[8px] font-bold text-white/30 tracking-wider">🔄 最終同期</span>
            <span class="text-white/88 font-mono font-bold">${lastSyncTime}</span>
            <span class="text-[#22c55e] flex items-center justify-center gap-0.5 font-bold">通信良好 ✔</span>
          </div>
        </div>
      </div>
    </div>
  `;
};
