import { MicroLedger } from '../../../aios/kernel/MicroLedger';
import { CoordinationResult } from '../../../aios/kernel/CoordinationResult';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testMicroLedgerGenesisAndAppend() {
  console.log('[Test] MicroLedger genesis block and append operations starting...');
  MicroLedger.reset();

  const state0 = MicroLedger.getChainState();
  assert(state0.entryCount === 0, "Initial entryCount should be 0");
  assert(state0.latestHash === "GENESIS", "Initial latestHash must be GENESIS");

  // 1. First block append
  const coordResult1: CoordinationResult = {
    accepted: true,
    coordinationId: "co-aios-decision-v1-timestamp123",
    nextStage: "SIGNING",
    targetAgents: ["agent-architecture"],
    errors: []
  };

  const block1 = MicroLedger.append(coordResult1);
  assert(block1.previousHash === "GENESIS", "First block previousHash must link to GENESIS");
  assert(block1.coordinationId === "co-aios-decision-v1-timestamp123", "Coordination ID mapping mismatch");
  assert(block1.protocolId === "aios-decision-v1", "Protocol ID lookup mismatch");
  assert(block1.protocolVersion === "1.0.0", "Protocol version lookup mismatch");

  const state1 = MicroLedger.getChainState();
  assert(state1.entryCount === 1, "Entry count must increment to 1");
  assert(state1.latestHash === block1.currentHash, "Chain latestHash must match block1 currentHash");

  // 2. Second block append (chain hashing verification)
  const coordResult2: CoordinationResult = {
    accepted: true,
    coordinationId: "co-aios-consensus-v1-timestamp456",
    nextStage: "LEDGER_COMMIT",
    targetAgents: ["agent-architecture"],
    errors: []
  };

  const block2 = MicroLedger.append(coordResult2);
  assert(block2.previousHash === block1.currentHash, "Second block previousHash must link to block1 currentHash");
  assert(block2.protocolId === "aios-consensus-v1", "Protocol ID lookup mismatch");

  const state2 = MicroLedger.getChainState();
  assert(state2.entryCount === 2, "Entry count must increment to 2");
  assert(state2.latestHash === block2.currentHash, "Chain latestHash must match block2 currentHash");

  const entries = MicroLedger.listEntries();
  assert(entries.length === 2, "List length must be 2");
  assert(entries[0].ledgerId.includes("co-aios-decision-v1"), "ledgerId naming pattern check failed");

  console.log('   ✓ MicroLedger genesis block and append operations: PASSED');
}

async function testMicroLedgerRejectedRejection() {
  console.log('[Test] MicroLedger rejection boundary checks starting...');
  MicroLedger.reset();

  const rejectedResult: CoordinationResult = {
    accepted: false,
    coordinationId: "co-failed-123",
    nextStage: "REJECTED",
    targetAgents: [],
    errors: [{ code: "VALIDATION_FAILED", message: "Schema failed" }]
  };

  let threwError = false;
  try {
    MicroLedger.append(rejectedResult);
  } catch (err: any) {
    threwError = true;
    assert(err.message.includes("Cannot append rejected coordination result"), "Error message validation failed");
  }

  assert(threwError, "Appending rejected coordination result must throw an error");
  assert(MicroLedger.getChainState().entryCount === 0, "Failed appends should not alter entry count");

  console.log('   ✓ MicroLedger rejection boundary checks: PASSED');
}

async function runAll() {
  console.log('--- Starting G7-4: MicroLedger Unit Tests ---');
  await testMicroLedgerGenesisAndAppend();
  await testMicroLedgerRejectedRejection();
  console.log('--- All G7-4: MicroLedger Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
