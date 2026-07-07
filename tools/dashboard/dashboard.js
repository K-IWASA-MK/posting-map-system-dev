// POSTING MAP Mission Control JS Store - Sprint 1-3
console.log("Mission Control Core Engine Initialized.");

// Configuration defaults
const MOCK_TARGETS = {
  activeMembers: 30,
  newMembers: 8,
  sheetsCount: 144900
};

// Initial logs database
const INITIAL_LOGS = [
  { time: "10:42", code: "S025", count: "300枚配布", area: "鈴鹿市" },
  { time: "10:30", code: "S012", count: "500枚配布", area: "津市" },
  { time: "10:15", code: "S008", count: "1,000枚配布", area: "四日市市" }
];

// Area pool for random log generation (to demonstrate "life")
const AREA_POOL = ["鈴鹿市", "津市", "四日市市", "桑名市", "亀山市"];
const DISTRIBUTOR_POOL = ["S005", "S014", "S022", "S031", "S009"];

// Animate counting numbers on page load (Rolling Numbers)
function animateValue(id, start, end, duration) {
  const obj = document.getElementById(id);
  if (!obj) return;
  const range = end - start;
  let current = start;
  const increment = end > start ? 1 : -1;
  const stepTime = Math.abs(Math.floor(duration / range));
  
  if (range > 1000) {
    let startTime = null;
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      obj.innerHTML = Math.floor(progress * (end - start) + start).toLocaleString();
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        obj.innerHTML = end.toLocaleString();
      }
    }
    window.requestAnimationFrame(step);
    return;
  }

  const timer = setInterval(() => {
    current += increment;
    obj.innerHTML = current.toLocaleString();
    if (current == end) {
      clearInterval(timer);
    }
  }, Math.max(stepTime, 10));
}

// Function to generate new realtime logs
function createLogElement(log, isNew = false) {
  const div = document.createElement("div");
  div.className = `flex items-center justify-between p-3 bg-[#161B22] border border-[rgba(255,255,255,0.06)] rounded-xl select-none transition-all duration-500 transform translate-y-[-10px] opacity-0`;
  
  if (isNew) {
    // Brand glow color for 3 seconds for new items
    div.style.borderColor = "#EA5F08";
    div.style.boxShadow = "0 0 12px rgba(234, 95, 8, 0.15)";
    setTimeout(() => {
      div.style.borderColor = "rgba(255,255,255,0.06)";
      div.style.boxShadow = "none";
    }, 3000);
  }

  div.innerHTML = `
    <div class="flex items-center gap-2">
      <span class="text-[9px] font-mono text-[rgba(255,255,255,0.3)]">${log.time}</span>
      <span class="w-1.5 h-1.5 bg-[#EA5F08] rounded-full shadow-[0_0_6px_#EA5F08]"></span>
      <span class="text-[10px] font-bold text-white font-mono">${log.code}</span>
      <span class="text-[10px] text-[rgba(255,255,255,0.6)]">${log.count}</span>
    </div>
    <span class="text-[8px] font-bold text-[#EA5F08] bg-[rgba(234,95,8,0.1)] px-2 py-0.5 rounded-md">${log.area}</span>
  `;
  return div;
}

// Initialize numbers and logs
window.addEventListener("DOMContentLoaded", () => {
  // Start rolling numbers after a tiny transition delay
  setTimeout(() => {
    animateValue("kpi-active-members", 0, MOCK_TARGETS.activeMembers, 800);
    animateValue("kpi-new-members", 0, MOCK_TARGETS.newMembers, 600);
    animateValue("kpi-sheets-count", 144500, MOCK_TARGETS.sheetsCount, 1000);
  }, 300);

  // Initialize static logs
  const logContainer = document.getElementById("log-stream-container");
  if (logContainer) {
    logContainer.innerHTML = "";
    INITIAL_LOGS.forEach(log => {
      const el = createLogElement(log);
      logContainer.appendChild(el);
      // Trigger entrance
      setTimeout(() => {
        el.classList.remove("translate-y-[-10px]", "opacity-0");
      }, 50);
    });
  }

  // Set up breathing life simulation: add a log and count sheets up slightly every 8 seconds
  setInterval(() => {
    // 1. Add log
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const randArea = AREA_POOL[Math.floor(Math.random() * AREA_POOL.length)];
    const randDist = DISTRIBUTOR_POOL[Math.floor(Math.random() * DISTRIBUTOR_POOL.length)];
    const randCountVal = Math.floor(Math.random() * 5 + 1) * 100;
    const randCount = `${randCountVal.toLocaleString()}枚配布`;

    const newLog = { time: timeStr, code: randDist, count: randCount, area: randArea };
    
    if (logContainer) {
      const el = createLogElement(newLog, true);
      logContainer.insertBefore(el, logContainer.firstChild);
      
      // Remove last child to maintain 100vh log overflow limits
      if (logContainer.children.length > 5) {
        logContainer.removeChild(logContainer.lastChild);
      }

      setTimeout(() => {
        el.classList.remove("translate-y-[-10px]", "opacity-0");
      }, 50);
    }

    // 2. Increment sheets count and animate kpi values slightly
    MOCK_TARGETS.sheetsCount += randCountVal;
    animateValue("kpi-sheets-count", MOCK_TARGETS.sheetsCount - randCountVal, MOCK_TARGETS.sheetsCount, 500);
    
    // Random active members fluctuation
    if (Math.random() > 0.6) {
      const currentActive = MOCK_TARGETS.activeMembers;
      MOCK_TARGETS.activeMembers += Math.random() > 0.5 ? 1 : -1;
      animateValue("kpi-active-members", currentActive, MOCK_TARGETS.activeMembers, 300);
    }
  }, 8000);
});
