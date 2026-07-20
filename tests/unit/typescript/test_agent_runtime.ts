import { AgentRuntime } from '../../../aios/runtime/AgentRuntime';
import { LedgerEntry } from '../../../aios/kernel/LedgerEntry';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testAgentRuntimeNormalFlow() {
  console.log('[Test] AgentRuntime normal flow starting...');

  const ledgerEntry: LedgerEntry = {
    ledgerId: "block-1-co-aios-decision-v1-timestamp",
    coordinationId: "co-aios-decision-v1-timestamp",
    protocolId: "aios-decision-v1",
    protocolVersion: "1.0.0",
    timestamp: "2026-07-20T12:00:00Z",
    previousHash: "GENESIS",
    currentHash: "current-hash-val",
    payloadHash: "payload-hash-val"
  };

  const targetAgent = "agent-architecture";

  const request = AgentRuntime.createSession(ledgerEntry, targetAgent);
  assert(request.agentId === targetAgent, "Target agent identifier mismatch");
  assert(request.protocolId === "aios-decision-v1", "Protocol ID mismatch");
  assert(request.protocolVersion === "1.0.0", "Protocol version mismatch");
  assert(request.runtimeStage === "EXECUTION", "Default runtime stage should be EXECUTION");

  // Verify ID Determinism Contract (Contract-04)
  const duplicateRequest = AgentRuntime.createSession(ledgerEntry, targetAgent);
  assert(request.requestId === duplicateRequest.requestId, "Request ID must be deterministic");
  assert(request.sessionId === duplicateRequest.sessionId, "Session ID must be deterministic");

  console.log('   ✓ AgentRuntime normal flow: PASSED');
}

async function testAgentRuntimeBoundaryFlow() {
  console.log('[Test] AgentRuntime boundary failure conditions starting...');

  const validLedgerEntry: LedgerEntry = {
    ledgerId: "block-1-co-aios-decision-v1-timestamp",
    coordinationId: "co-aios-decision-v1-timestamp",
    protocolId: "aios-decision-v1",
    protocolVersion: "1.0.0",
    timestamp: "2026-07-20T12:00:00Z",
    previousHash: "GENESIS",
    currentHash: "current-hash-val",
    payloadHash: "payload-hash-val"
  };

  // 1. Invalid empty target agent string
  let threwEmptyAgent = false;
  try {
    AgentRuntime.createSession(validLedgerEntry, "");
  } catch (err: any) {
    threwEmptyAgent = true;
    assert(err.message.includes("Target agent identifier cannot be empty"), "Invalid error message returned");
  }
  assert(threwEmptyAgent, "Empty targetAgent must throw an error");

  // 2. Invalid LedgerEntry (missing currentHash) (Contract-01)
  const invalidLedgerEntry: LedgerEntry = {
    ledgerId: "block-1-co-aios-decision-v1-timestamp",
    coordinationId: "co-aios-decision-v1-timestamp",
    protocolId: "aios-decision-v1",
    protocolVersion: "1.0.0",
    timestamp: "2026-07-20T12:00:00Z",
    previousHash: "GENESIS",
    currentHash: "", // Invalid hash
    payloadHash: "payload-hash-val"
  };

  let threwInvalidEntry = false;
  try {
    AgentRuntime.createSession(invalidLedgerEntry, "agent-architecture");
  } catch (err: any) {
    threwInvalidEntry = true;
    assert(err.message.includes("Invalid or corrupt LedgerEntry"), "Invalid error message returned");
  }
  assert(threwInvalidEntry, "Invalid LedgerEntry must throw an error");

  console.log('   ✓ AgentRuntime boundary failure conditions: PASSED');
}

async function runAll() {
  console.log('--- Starting G7-5: AgentRuntime Unit Tests ---');
  await testAgentRuntimeNormalFlow();
  await testAgentRuntimeBoundaryFlow();
  console.log('--- All G7-5: AgentRuntime Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
