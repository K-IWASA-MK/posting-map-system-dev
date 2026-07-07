// POSTING MAP Mission Control JS Store - Sprint 1-4
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

// Area pool for random log generation
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

// Function to generate new realtime logs with timeline structure
function createLogElement(log, isNew = false) {
  const div = document.createElement("div");
  div.className = `flex items-center justify-between pl-6 pr-3 py-2 bg-[#161B22]/30 border border-[rgba(255,255,255,0.04)] rounded-xl relative select-none transition-all duration-500 transform translate-y-[-10px] opacity-0 hover:bg-white/[0.01]`;
  
  if (isNew) {
    // Brand glow border for 3 seconds for new items
    div.style.borderColor = "rgba(217, 90, 16, 0.4)";
    div.style.boxShadow = "0 0 10px rgba(217, 90, 16, 0.1)";
    setTimeout(() => {
      div.style.borderColor = "rgba(255,255,255,0.04)";
      div.style.boxShadow = "none";
    }, 3000);
  }

  div.innerHTML = `
    <!-- Timeline Dot Overlaying Vertical Line -->
    <div class="absolute left-[8px] top-1/2 -translate-y-1/2 w-2 h-2 bg-[#D95A10] border-2 border-[#161B22] rounded-full z-10 shadow-[0_0_6px_#D95A10]"></div>
    
    <div class="flex items-center gap-3">
      <span class="text-[9px] font-mono text-[rgba(255,255,255,0.3)]">${log.time}</span>
      <span class="text-[10px] font-bold text-white font-mono">${log.code}</span>
      <span class="text-[10px] text-[rgba(255,255,255,0.65)]">${log.count}</span>
    </div>
    <span class="text-[8px] font-bold text-[#D95A10] bg-[rgba(217,90,16,0.1)] px-2 py-0.5 rounded-md">${log.area}</span>
  `;
  return div;
}

// Initialize interactive SVG chart mouse-move tracker
function initChartInteraction() {
  const trendContainer = document.getElementById("trend-chart-container");
  const svg = document.getElementById("trend-svg");
  const guideLine = document.getElementById("hover-guide-line");
  const dataPoint = document.getElementById("hover-data-point");
  const tooltip = document.getElementById("chart-tooltip");
  const tooltipTime = document.getElementById("tooltip-time");
  const tooltipValue = document.getElementById("tooltip-value");

  if (trendContainer && svg && guideLine && dataPoint && tooltip) {
    const linePath = document.getElementById("trend-line-path");
    if (!linePath) return;
    const pathLength = linePath.getTotalLength();

    trendContainer.addEventListener("mousemove", (e) => {
      const rect = svg.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      
      // Calculate coordinates and path percentage
      const pct = Math.max(0, Math.min(mouseX / rect.width, 1));
      const targetLength = pct * pathLength;
      
      const pt = linePath.getPointAtLength(targetLength);
      
      // Position elements
      guideLine.setAttribute("x1", pt.x);
      guideLine.setAttribute("x2", pt.x);
      dataPoint.setAttribute("cx", pt.x);
      dataPoint.setAttribute("cy", pt.y);
      
      const tooltipX = pt.x * (rect.width / 700);
      const tooltipY = pt.y * (rect.height / 200);
      
      tooltip.style.left = `${tooltipX + 15}px`;
      tooltip.style.top = `${tooltipY - 40}px`;
      
      // Format time and value based on coordinate position
      const hour = Math.floor(9 + pct * 2); 
      const minute = Math.floor((pct * 2 % 1) * 60);
      const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      const activeVal = Math.floor(12 + (200 - pt.y) / 150 * 25);
      
      tooltipTime.textContent = timeStr;
      tooltipValue.textContent = `${activeVal}人 配布中`;
      
      // Show guide overlay
      guideLine.style.display = "block";
      dataPoint.style.display = "block";
      tooltip.classList.remove("hidden");
    });
    
    trendContainer.addEventListener("mouseleave", () => {
      // Clean display state
      guideLine.style.display = "none";
      dataPoint.style.display = "none";
      tooltip.classList.add("hidden");
    });
  }
}

// Main initializer
window.addEventListener("DOMContentLoaded", () => {
  // Start rolling numbers after transition delay
  setTimeout(() => {
    animateValue("kpi-active-members", 0, MOCK_TARGETS.activeMembers, 800);
    animateValue("kpi-new-members", 0, MOCK_TARGETS.newMembers, 600);
    animateValue("kpi-sheets-count", 144500, MOCK_TARGETS.sheetsCount, 1000);
  }, 300);

  // Initialize timeline stream logs
  const logContainer = document.getElementById("log-stream-container");
  if (logContainer) {
    logContainer.innerHTML = "";
    INITIAL_LOGS.forEach(log => {
      const el = createLogElement(log);
      logContainer.appendChild(el);
      setTimeout(() => {
        el.classList.remove("translate-y-[-10px]", "opacity-0");
      }, 50);
    });
  }

  // Bind SVG line chart trackers
  initChartInteraction();

  // Set up breathing life simulation
  setInterval(() => {
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
      
      if (logContainer.children.length > 5) {
        logContainer.removeChild(logContainer.lastChild);
      }

      setTimeout(() => {
        el.classList.remove("translate-y-[-10px]", "opacity-0");
      }, 50);
    }

    MOCK_TARGETS.sheetsCount += randCountVal;
    animateValue("kpi-sheets-count", MOCK_TARGETS.sheetsCount - randCountVal, MOCK_TARGETS.sheetsCount, 500);
    
    if (Math.random() > 0.6) {
      const currentActive = MOCK_TARGETS.activeMembers;
      MOCK_TARGETS.activeMembers += Math.random() > 0.5 ? 1 : -1;
      animateValue("kpi-active-members", currentActive, MOCK_TARGETS.activeMembers, 300);
    }
  }, 8000);
});
