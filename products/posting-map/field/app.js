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
let authContext = null;

function rebuildAuthorizationContext(registry, policies) {
  let trust = 0.850;
  let mode = "BLOCKED";
  let drift = "UNKNOWN";
  
  if (registry && registry.ai_agent) {
    trust = registry.ai_agent.driftScore;
  } else if (authContext) {
    trust = authContext.trustScore;
  }
  
  if (policies && policies.ai_agent) {
    const policyCfg = policies.ai_agent.compiledPolicy || {};
    mode = policyCfg.mode || "BLOCKED";
    drift = policies.ai_agent.driftState || "UNKNOWN";
  } else if (authContext) {
    mode = authContext.policyMode;
    drift = authContext.driftState;
  }

  // Create immutable context object (SSoAC)
  const context = {
    version: 1,
    staffId: "S025",
    lineUserId: "U_LINE_MOCK_S025_UUID",
    policyMode: mode,
    trustScore: trust,
    driftState: drift,
    sessionId: authContext ? authContext.sessionId : `SES-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    authenticatedAt: authContext ? authContext.authenticatedAt : new Date().toISOString(),
    policyRevision: "v4.20"
  };
  
  Object.freeze(context);
  authContext = context;
  
  // Trigger UI update using context only
  updateSecurityConstraints(authContext);
}

function connectWS() {
  const params = new URLSearchParams(window.location.search);
  const wsUrl = params.get('ws') || 'ws://localhost:8080';
  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    connInd.className = 'indicator online';
    connLbl.textContent = 'ONLINE';
    console.log("H-App connected to Event Bus.");
  };

  ws.onclose = () => {
    connInd.className = 'indicator';
    connLbl.textContent = 'DISCONNECTED';
    console.log("H-App disconnected. Retrying...");
    
    // Clear context and lock UI upon connection loss (defense mechanism)
    authContext = null;
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) loadingOverlay.classList.remove('hidden');
    
    setTimeout(connectWS, 3000);
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === "INITIAL_STATE") {
        const { registry, policies, latestAssignment } = data.payload;
        
        // Sync context
        rebuildAuthorizationContext(registry, policies);
        
        // Render current assignment if loaded
        if (latestAssignment) {
          renderTask(latestAssignment);
        }
      } else {
        const { type, payload } = data;
        
        if (type === "TRUST_UPDATED") {
          rebuildAuthorizationContext(payload, null);
        } else if (type === "POLICY_COMPILED") {
          rebuildAuthorizationContext(null, payload);
        } else if (type === "FIELD_EXECUTED" && payload.action === "ASSIGN_FLYER") {
          renderTask(payload);
        }
      }
    } catch (e) {
      console.error("Error parsing socket event in H-App:", e.message);
    }
  };
}

function updateSecurityConstraints(ctx) {
  if (!ctx) return;
  
  // 1. Sync trust score
  trustVal.textContent = ctx.trustScore.toFixed(3);
  
  // 2. Sync active sandbox limits
  lawBadge.textContent = ctx.policyMode;
  lawBadge.className = 'law-mode-badge';
  
  const modeStyle = `mode-${ctx.policyMode.toLowerCase().replace('_', '')}`;
  lawBadge.classList.add(modeStyle);
  
  // Control overlays based on active mode
  const loadingOverlay = document.getElementById('loading-overlay');
  const blockedOverlay = document.getElementById('blocked-overlay');
  
  if (loadingOverlay) {
    loadingOverlay.classList.add('hidden');
  }
  
  if (ctx.policyMode === "BLOCKED") {
    if (blockedOverlay) blockedOverlay.classList.remove('hidden');
    btnConfirm.disabled = true;
    btnConfirm.textContent = "Access Blocked";
  } else if (ctx.policyMode === "SANDBOX") {
    if (blockedOverlay) blockedOverlay.classList.add('hidden');
    btnConfirm.disabled = true;
    btnConfirm.textContent = "Distribution Blocked (SANDBOX)";
  } else {
    if (blockedOverlay) blockedOverlay.classList.add('hidden');
    btnConfirm.disabled = false;
    btnConfirm.textContent = "Confirm Flyer Distribution";
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
