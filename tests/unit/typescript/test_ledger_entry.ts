import { LedgerEntry } from '../../../aios/kernel/LedgerEntry';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testLedgerEntryStructure() {
  console.log('[Test] LedgerEntry block structure starting...');

  const entry: LedgerEntry = {
    ledgerId: "block-1",
    coordinationId: "co-12345",
    protocolId: "aios-decision-v1",
    protocolVersion: "1.0.0",
    timestamp: "2026-07-20T12:00:00Z",
    previousHash: "GENESIS",
    currentHash: "current-hash-val",
    payloadHash: "payload-hash-val"
  };

  assert(entry.ledgerId === "block-1", "ledgerId mismatch");
  assert(entry.coordinationId === "co-12345", "coordinationId mismatch");
  assert(entry.protocolId === "aios-decision-v1", "protocolId mismatch");
  assert(entry.protocolVersion === "1.0.0", "protocolVersion mismatch");
  assert(entry.timestamp === "2026-07-20T12:00:00Z", "timestamp mismatch");
  assert(entry.previousHash === "GENESIS", "previousHash mismatch");
  assert(entry.currentHash === "current-hash-val", "currentHash mismatch");
  assert(entry.payloadHash === "payload-hash-val", "payloadHash mismatch");

  console.log('   ✓ LedgerEntry block structure: PASSED');
}

async function runAll() {
  console.log('--- Starting G7-4: LedgerEntry Unit Tests ---');
  await testLedgerEntryStructure();
  console.log('--- All G7-4: LedgerEntry Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
