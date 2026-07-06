const fs = require('fs');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const HTTP_PORT = 8081;
const WS_PORT = 8080;

const REGISTRY_FILE = path.join(__dirname, 'trust_registry.json');
const POLICIES_FILE = path.join(__dirname, 'compiled_policies.json');

const usedEventIds = new Set();
let lastSequenceId = 0;

// Expose WebSocket Server
const wss = new WebSocket.Server({ port: WS_PORT });
console.log(`WebSocket Event Bus listening on ws://localhost:${WS_PORT}`);

function broadcast(event) {
  const payload = JSON.stringify(event);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

function getInitialState() {
  let registry = {};
  let policies = {};
  let latestAssignment = null;
  const COMMANDS_FILE = path.join(__dirname, 'field_commands.jsonl');
  try {
    if (fs.existsSync(REGISTRY_FILE)) {
      registry = JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8'));
    }
    if (fs.existsSync(POLICIES_FILE)) {
      policies = JSON.parse(fs.readFileSync(POLICIES_FILE, 'utf8'));
    }
    if (fs.existsSync(COMMANDS_FILE)) {
      const lines = fs.readFileSync(COMMANDS_FILE, 'utf8').trim().split('\n');
      for (let i = lines.length - 1; i >= 0; i--) {
        if (!lines[i]) continue;
        const cmd = JSON.parse(lines[i]);
        if (cmd.action === 'ASSIGN_FLYER') {
          latestAssignment = cmd;
          break;
        }
      }
    }
  } catch (e) {
    console.error("Error reading initial states:", e.message);
  }
  return {
    type: "INITIAL_STATE",
    payload: { registry, policies, latestAssignment }
  };
}

wss.on('connection', ws => {
  console.log("Monitoring UI Dashboard client connected.");
  // Emit initial state payload to immediately synchronize the stateless UI projection
  ws.send(JSON.stringify(getInitialState()));
  
  ws.on('close', () => {
    console.log("Monitoring UI Dashboard client disconnected.");
  });
});

// Expose HTTP API for Python Publishers & Browser clients with CORS support
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/publish') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const event = JSON.parse(body);
        const { eventId, sequenceId, type, source, payload } = event;

        if (!eventId || !sequenceId || !type) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: "Missing required event fields (eventId, sequenceId, type)" }));
          return;
        }

        // Duplicate reject check
        if (usedEventIds.has(eventId)) {
          console.warn(`Duplicate event rejected: ${eventId}`);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: "Duplicate event detected" }));
          return;
        }

        // Monotonic sequence order check
        if (sequenceId <= lastSequenceId) {
          console.warn(`Out of order event rejected: sequenceId ${sequenceId} <= lastSequenceId ${lastSequenceId}`);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: "Out of order sequence rejected" }));
          return;
        }

        // Validate success
        usedEventIds.add(eventId);
        lastSequenceId = sequenceId;

        // Broadcast to WebSocket clients
        broadcast(event);

        console.log(`Event broadcast successfully: ${type} (Seq: ${sequenceId}, Src: ${source})`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: "ACK", eventId }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: `Invalid JSON payload: ${err.message}` }));
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(HTTP_PORT, () => {
  console.log(`HTTP Event Ingestion API listening on http://localhost:${HTTP_PORT}`);
});
