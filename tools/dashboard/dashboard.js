// AIOS Monitoring v3.1 Pro - Stateless Dynamic Projector
const wsIndicator = document.getElementById('ws-indicator');
const wsStatus = document.getElementById('ws-status');
const timelineLog = document.getElementById('timeline-log');
const policyContainer = document.getElementById('policy-container');

let ws = null;
let lastSequenceId = 0;

function connectWS() {
  ws = new WebSocket('ws://localhost:8080');

  ws.onopen = () => {
    wsIndicator.className = 'status-indicator online';
    wsStatus.textContent = 'ONLINE';
    console.log("WebSocket connection established with AIOS Event Bus.");
  };

  ws.onclose = () => {
    wsIndicator.className = 'status-indicator';
    wsStatus.textContent = 'DISCONNECTED';
    console.log("WebSocket connection closed. Retrying in 3 seconds...");
    setTimeout(connectWS, 3000);
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === "INITIAL_STATE") {
        const { registry, policies } = data.payload;
        // Project initial states
        projectTrustGraph(registry);
        projectPolicies(policies);
        appendLogItem("INITIAL_STATE", "event_bus", "Synchronized initial registry state from compiled laws.");
      } else {
        const { eventId, sequenceId, timestamp, source, type, payload } = data;
        
        // Monotonic sequence verification at observation layer
        if (sequenceId <= lastSequenceId) {
          console.warn(`Observation rejected out-of-order packet: Seq ${sequenceId}`);
          return;
        }
        lastSequenceId = sequenceId;

        // Route state updates
        if (type === "TRUST_UPDATED") {
          projectTrustGraph(payload);
          appendLogItem("TRUST_UPDATED", source, "Trust scores and drift status re-evaluated.");
        } else if (type === "POLICY_COMPILED") {
          projectPolicies(payload);
          appendLogItem("POLICY_COMPILED", source, "Governance policy compilation rebuilt offline.");
        } else if (type === "FIELD_EXECUTED") {
          const { action, targetNode, commandId } = payload;
          appendLogItem("FIELD_EXECUTED", source, `Executed CMD: ${action} on ${targetNode} (${commandId})`);
        }
      }
    } catch (e) {
      console.error("Error parsing event stream payload:", e.message);
    }
  };
}

function projectTrustGraph(registry) {
  if (!registry) return;
  Object.keys(registry).forEach(nodeId => {
    const nodeEl = document.getElementById(`node-${nodeId}`);
    if (nodeEl) {
      const data = registry[nodeId];
      const score = data.driftScore !== undefined ? data.driftScore : (data.trustScore !== undefined ? data.trustScore : 0.0);
      const state = data.state || "BLOCKED";

      // Reset node class styles
      nodeEl.className = 'graph-node';
      
      // Map state color indicators
      if (state === "ACTIVE") {
        nodeEl.classList.add('node-state-active');
      } else if (state === "Restrict") {
        nodeEl.classList.add('node-state-restrict');
      } else if (state === "SANDBOX") {
        nodeEl.classList.add('node-state-sandbox');
      } else {
        nodeEl.classList.add('node-state-blocked');
      }

      // Update badge text
      const badge = nodeEl.querySelector('.node-score-badge');
      if (badge) {
        badge.textContent = score.toFixed(3);
      }
    }
  });
}

function projectPolicies(policies) {
  if (!policies || Object.keys(policies).length === 0) return;
  
  policyContainer.innerHTML = '';
  
  Object.keys(policies).forEach(nodeId => {
    const data = policies[nodeId];
    const { mode, limits } = data.compiledPolicy || { mode: "BLOCKED", limits: {} };
    
    const card = document.createElement('div');
    card.className = 'policy-card';
    
    // Normalize mode names for styles
    const modeStyle = `mode-${mode.toLowerCase().replace('_', '')}`;
    
    card.innerHTML = `
      <div class="policy-node-header">
        <span style="font-weight: 600;">${nodeId}</span>
        <span class="policy-mode ${modeStyle}">${mode}</span>
      </div>
      <div class="limits-grid">
        <div class="limit-item">
          <span>write</span>
          <span class="limit-value ${limits.write ? 'limit-allowed' : 'limit-denied'}">${limits.write ? 'YES' : 'NO'}</span>
        </div>
        <div class="limit-item">
          <span>exec</span>
          <span class="limit-value ${limits.exec ? 'limit-allowed' : 'limit-denied'}">${limits.exec ? 'YES' : 'NO'}</span>
        </div>
        <div class="limit-item">
          <span>network</span>
          <span class="limit-value ${limits.network ? 'limit-allowed' : 'limit-denied'}">${limits.network ? 'YES' : 'NO'}</span>
        </div>
      </div>
    `;
    
    policyContainer.appendChild(card);
  });
}

function appendLogItem(type, source, message) {
  // Clear awaiting message if present
  if (timelineLog.children.length === 1 && timelineLog.children[0].textContent.includes("Awaiting")) {
    timelineLog.innerHTML = '';
  }

  const log = document.createElement('div');
  log.className = 'log-item';
  
  const timeStr = new Date().toLocaleTimeString();
  
  log.innerHTML = `
    <div class="log-meta">
      <span>${type}</span>
      <span>${timeStr} (${source})</span>
    </div>
    <div style="font-weight: 500; font-size: 0.9rem;">${message}</div>
  `;
  
  timelineLog.insertBefore(log, timelineLog.firstChild);

  // Keep logs list capped below 20 entries
  while (timelineLog.children.length > 20) {
    timelineLog.removeChild(timelineLog.lastChild);
  }
}

// Start WebSocket connection loop
connectWS();
