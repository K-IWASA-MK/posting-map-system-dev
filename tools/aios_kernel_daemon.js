#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');

// <BOOT_ANCHOR_START>
const GOLDEN_HASH = "37a569886229458f87ffd662e891fbcdfbbe8984bb3df3e48f1f48bbb6838243";
// <BOOT_ANCHOR_END>

const TASKS_FILE = path.join(__dirname, 'ai_tasks.json');
const EVENTS_FILE = path.join(__dirname, 'orchestrator_events.json');
const CERT_FILE = path.join(__dirname, 'proposal_validation_result.json');
const SECRET_FILE = path.join(__dirname, '.kernel_secret');

// Pre-Boot Verification Phase (Pre-Trust Mode)
let hmacSecret = null;
let kernelState = "PRE_BOOT";

function selfVerify() {
  const selfPath = __filename;
  try {
    const content = fs.readFileSync(selfPath, 'utf8');
    const normalized = content.replace(/\/\/ <BOOT_ANCHOR_START>[\s\S]*?\/\/ <BOOT_ANCHOR_END>/, '');
    const hash = crypto.createHash('sha256').update(normalized).digest('hex');
    
    if (hash !== GOLDEN_HASH) {
      console.error(`Kernel Boot Attestation FAILED: Integrity compromised! Calculated: ${hash}, Expected: ${GOLDEN_HASH}`);
      process.exit(1);
    }
  } catch (err) {
    console.error("Kernel self-integrity verification error:", err.message);
    process.exit(1);
  }
}

selfVerify();

// Trusted Mode Activation Phase
kernelState = "TRUSTED";

if (fs.existsSync(SECRET_FILE)) {
  try {
    hmacSecret = fs.readFileSync(SECRET_FILE, 'utf8').trim();
  } catch (e) {
    hmacSecret = crypto.randomBytes(32).toString('hex');
    fs.writeFileSync(SECRET_FILE, hmacSecret, { encoding: 'utf8', mode: 0o600 });
  }
} else {
  hmacSecret = crypto.randomBytes(32).toString('hex');
  try {
    fs.writeFileSync(SECRET_FILE, hmacSecret, { encoding: 'utf8', mode: 0o600 });
  } catch (e) {}
}

const usedNonces = new Set();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

function logEvent(taskId, eventType, agentId, details) {
  let events = [];
  if (fs.existsSync(EVENTS_FILE)) {
    try {
      events = JSON.parse(fs.readFileSync(EVENTS_FILE, 'utf8'));
    } catch (e) {}
  }
  const eventId = `EVT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(events.length + 1).padStart(4, '0')}`;
  const event = {
    eventId,
    eventVersion: "1.0.0",
    taskId,
    eventType,
    timestamp: new Date().toISOString(),
    agentId,
    details
  };
  events.push(event);
  fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2), 'utf8');
}

function calculateSignature(data) {
  const hmac = crypto.createHmac('sha256', hmacSecret);
  hmac.update(JSON.stringify(data));
  return hmac.digest('hex');
}

function handleRequest(req) {
  const { jsonrpc, method, params, id } = req;
  if (jsonrpc !== '2.0') {
    return { jsonrpc: '2.0', error: { code: -32600, message: 'Invalid Request' }, id };
  }

  try {
    if (method === 'getKernelAttestation') {
      return {
        jsonrpc: '2.0',
        result: {
          status: "SUCCESS",
          state: kernelState,
          hash: GOLDEN_HASH,
          attestationId: `ATT-${crypto.randomBytes(8).toString('hex').toUpperCase()}`,
          verifiedAt: new Date().toISOString()
        },
        id
      };
    } else if (method === 'validateProposal') {
      const { taskId, proposalPath, timestamp, nonce, executionSessionId } = params;

      if (usedNonces.has(nonce)) {
        return { jsonrpc: '2.0', error: { code: -32001, message: 'Replay detected: nonce already used' }, id };
      }
      usedNonces.add(nonce);

      const diff = Math.abs(Date.now() - new Date(timestamp).getTime()) / 1000;
      if (diff > 10) {
        return { jsonrpc: '2.0', error: { code: -32002, message: `Replay prevention: timestamp drift too large (${diff}s)` }, id };
      }

      if (!fs.existsSync(TASKS_FILE)) {
        return { jsonrpc: '2.0', error: { code: -32003, message: 'Task database not found' }, id };
      }
      const tasksData = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
      const task = tasksData.tasks.find(t => t.taskId === taskId);
      if (!task) {
        return { jsonrpc: '2.0', error: { code: -32004, message: `Task '${taskId}' not found` }, id };
      }

      const app = task.approval || {};
      if (app.executionState !== 'RUNNING') {
        return { jsonrpc: '2.0', error: { code: -32005, message: `Execution State is '${app.executionState}', expected 'RUNNING'` }, id };
      }

      const session = app.executionSession || {};
      if (session.executionSessionId !== executionSessionId) {
        return { jsonrpc: '2.0', error: { code: -32006, message: 'Session ID mismatch' }, id };
      }

      if (!fs.existsSync(proposalPath)) {
        return { jsonrpc: '2.0', error: { code: -32007, message: `Proposal patch file '${proposalPath}' not found` }, id };
      }

      const valId = `VAL-${new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '')}`;
      const certData = {
        taskId,
        proposalFile: proposalPath,
        validationId: valId,
        status: "VALIDATION_PASSED",
        validatedBy: "AIOS-Physical-Kernel-Daemon-v1",
        validatedAt: new Date().toISOString()
      };
      
      const signature = calculateSignature(certData);
      const signedCert = { ...certData, signature };

      fs.writeFileSync(CERT_FILE, JSON.stringify(signedCert, null, 2), 'utf8');

      logEvent(taskId, "PROPOSAL_VALIDATED", "PhysicalKernel", {
        validationId: valId,
        proposalFile: proposalPath,
        msg: `Transformation Proposal cryptographically signed for task ${taskId}.`
      });

      return { jsonrpc: '2.0', result: signedCert, id };

    } else if (method === 'verifySignature') {
      const { cert } = params;
      if (!cert || !cert.signature) {
        return { jsonrpc: '2.0', result: { valid: false, error: 'Certificate missing signature' }, id };
      }

      const certCopy = { ...cert };
      delete certCopy.signature;

      const expectedSig = calculateSignature(certCopy);
      const valid = expectedSig === cert.signature;

      return { jsonrpc: '2.0', result: { valid }, id };

    } else {
      return { jsonrpc: '2.0', error: { code: -32601, message: 'Method not found' }, id };
    }
  } catch (err) {
    return { jsonrpc: '2.0', error: { code: -32603, message: `Internal error: ${err.message}` }, id };
  }
}

rl.on('line', (line) => {
  if (line.trim() === '') return;
  try {
    const req = JSON.parse(line);
    const res = handleRequest(req);
    console.log(JSON.stringify(res));
  } catch (e) {
    console.log(JSON.stringify({ jsonrpc: '2.0', error: { code: -32700, message: 'Parse error' }, id: null }));
  }
});

console.error("AIOS Kernel Daemon Initialized.");
