// POSTING MAP MVP - Field Worker H-App Script
const connInd = document.getElementById('conn-ind');
const connLbl = document.getElementById('conn-lbl');
const trustVal = document.getElementById('trust-val');
const lawBadge = document.getElementById('law-badge');

const taskCard = document.getElementById('task-card');
const taskArea = document.getElementById('task-area');
const taskFlyers = document.getElementById('task-flyers');
const taskMeta = document.getElementById('task-meta');
const emptyCard = document.getElementById('empty-card');

const btnConfirm = document.getElementById('btn-confirm');
const btnGps = document.getElementById('btn-gps');

let ws = null;
let currentCommandId = null;
let currentAreaId = null;

function connectWS() {
  ws = new WebSocket('ws://localhost:8080');

  ws.onopen = () => {
    connInd.className = 'indicator online';
    connLbl.textContent = 'ONLINE';
    console.log("H-App connected to Event Bus.");
  };

  ws.onclose = () => {
    connInd.className = 'indicator';
    connLbl.textContent = 'DISCONNECTED';
    console.log("H-App disconnected. Retrying...");
    setTimeout(connectWS, 3000);
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === "INITIAL_STATE") {
        const { registry, policies, latestAssignment } = data.payload;
        
        // Sync active trust & compiled policy constraints
        updateSecurityConstraints(registry, policies);
        
        // Render current assignment if loaded
        if (latestAssignment) {
          renderTask(latestAssignment);
        }
      } else {
        const { type, payload } = data;
        
        if (type === "TRUST_UPDATED") {
          updateSecurityConstraints(payload, null);
        } else if (type === "POLICY_COMPILED") {
          updateSecurityConstraints(null, payload);
        } else if (type === "FIELD_EXECUTED" && payload.action === "ASSIGN_FLYER") {
          renderTask(payload);
        }
      }
    } catch (e) {
      console.error("Error parsing socket event in H-App:", e.message);
    }
  };
}

function updateSecurityConstraints(registry, policies) {
  // 1. Sync trust score
  if (registry && registry.ai_agent) {
    trustVal.textContent = registry.ai_agent.driftScore.toFixed(3);
  }
  
  // 2. Sync active sandbox limits
  if (policies && policies.ai_agent) {
    const { mode, limits } = policies.ai_agent.compiledPolicy || { mode: "BLOCKED", limits: {} };
    
    // Update badge styling
    lawBadge.textContent = mode;
    lawBadge.className = 'law-mode-badge';
    
    const modeStyle = `mode-${mode.toLowerCase().replace('_', '')}`;
    lawBadge.classList.add(modeStyle);
    
    // Force write restriction execution on physical button
    if (mode === "BLOCKED" || mode === "SANDBOX" || !limits.write) {
      btnConfirm.disabled = true;
      btnConfirm.textContent = "Distribution Blocked (SANDBOX)";
    } else {
      btnConfirm.disabled = false;
      btnConfirm.textContent = "Confirm Flyer Distribution";
    }
  }
}

function renderTask(cmd) {
  const { commandId, targetNode, payload } = cmd;
  currentCommandId = commandId;
  currentAreaId = payload.areaId;
  
  taskArea.textContent = `Region: ${targetNode} (Area ID: ${payload.areaId})`;
  taskFlyers.innerHTML = `${payload.quantity} <span style="font-size: 1.2rem; font-weight: 600; color: var(--text-sub);">flyers</span>`;
  taskMeta.textContent = `Command Link: ${commandId} | Trigger event: ${cmd.sourceEventId || 'N/A'}`;
  
  emptyCard.style.display = 'none';
  taskCard.style.display = 'block';
}

function sendFieldReport(action, payload) {
  // Generate Event Envelope
  const envelope = {
    eventId: `EVT-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now().toString().slice(-4)}`,
    sequenceId: Date.now(), // Fallback epoch timestamp since H-App is stateless reporter
    timestamp: Date.now() / 1000,
    source: "posting_map_h_app",
    type: "FIELD_EXECUTED",
    payload: {
      action: action,
      userId: "S025",
      ...payload
    }
  };

  fetch('http://localhost:8081/publish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(envelope)
  })
  .then(res => {
    if (res.ok) {
      console.log(`Field telemetry report dispatched: ${action}`);
      if (action === "CONFIRM_DISTRIBUTION") {
        // Complete current assignment local view
        taskCard.style.display = 'none';
        emptyCard.style.display = 'flex';
        currentCommandId = null;
      }
    } else {
      alert("Error transmitting field report to AIOS Bridge.");
    }
  })
  .catch(err => {
    console.error("Failed to connect to AIOS HTTP API:", err);
  });
}

// Bind Simulator Button Actions
btnConfirm.addEventListener('click', () => {
  if (currentCommandId) {
    sendFieldReport("CONFIRM_DISTRIBUTION", {
      targetNode: `task_${currentAreaId}`,
      commandId: currentCommandId
    });
  }
});

btnGps.addEventListener('click', () => {
  sendFieldReport("GPS_LOG", {
    targetNode: "gps_node_s025",
    latitude: 35.0674,
    longitude: 136.6831
  });
});

// Start WS handshake
connectWS();
