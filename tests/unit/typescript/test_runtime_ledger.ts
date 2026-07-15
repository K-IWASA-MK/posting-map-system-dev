import { RuntimeLedger } from '../../../core/runtime-ledger/RuntimeLedger';
import { LedgerEntryFactory } from '../../../core/runtime-ledger/LedgerEntryFactory';
import { FileLedgerStorage } from '../../../core/runtime-ledger/FileLedgerStorage';
import { LedgerEntryIdProvider } from '../../../core/runtime-ledger/LedgerEntryIdProvider';
import { ILedgerStorage } from '../../../core/runtime-ledger/ILedgerStorage';
import { LedgerEntry } from '../../../core/runtime-ledger/LedgerEntry';
import { LedgerStorageResult } from '../../../core/runtime-ledger/LedgerStorageResult';
import { LedgerQueryFilter } from '../../../core/runtime-ledger/LedgerQueryFilter';
import { RuntimeEventBus } from '../../../core/runtime-event-bus/RuntimeEventBus';
import { SystemClock } from '../../../core/runtime-scheduler/SystemClock';
import * as fs from 'fs/promises';
import * as path from 'path';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

class MockEventIdProvider {
  private count = 0;
  public generateEventId(): string {
    this.count++;
    return `ev-${this.count}`;
  }
}

class FaultyStorage implements ILedgerStorage {
  public async append(entry: LedgerEntry): Promise<LedgerStorageResult> {
    throw new Error('Disk full simulated error');
  }
  public async query(filter?: LedgerQueryFilter): Promise<LedgerEntry[]> {
    return [];
  }
}

const TEMP_LEDGER_FILE = path.join(__dirname, 'test-ledger.jsonl');

async function cleanTempFile() {
  try {
    await fs.unlink(TEMP_LEDGER_FILE);
  } catch (err) {}
}

// ==============================================================================
// Test 1: Normal Audit Append and Filter Query
// ==============================================================================
async function testNormalAppendAndQuery() {
  console.log('[Test 1] Normal append and query starting...');
  await cleanTempFile();

  const clock = new SystemClock();
  const idProvider = new LedgerEntryIdProvider();
  const factory = new LedgerEntryFactory(clock, idProvider);
  const storage = new FileLedgerStorage(TEMP_LEDGER_FILE);
  const eventBus = new RuntimeEventBus(new MockEventIdProvider());
  const ledger = new RuntimeLedger(storage, factory, eventBus);

  // Publish target events
  eventBus.publish({
    eventId: 'evt-100',
    timestamp: Date.now(),
    type: 'LAUNCH_REQUESTED',
    source: 'Launcher',
    projectId: 'proj-1',
    sessionId: 'sess-1',
    payload: { info: 'first' }
  });

  eventBus.publish({
    eventId: 'evt-200',
    timestamp: Date.now(),
    type: 'SESSION_COMPLETED',
    source: 'ExecutionSession',
    projectId: 'proj-2',
    sessionId: 'sess-2',
    payload: { info: 'second' }
  });

  // Since append is async, wait until metrics update (up to 1500ms)
  const startTime = Date.now();
  while (ledger.getMetrics().successfulWrites < 2 && Date.now() - startTime < 1500) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  const metrics = ledger.getMetrics();
  assert(metrics.totalEntries === 2, `Expected 2 entries, got: ${metrics.totalEntries}`);
  assert(metrics.successfulWrites === 2, `Expected 2 successful writes, got: ${metrics.successfulWrites}`);
  assert(metrics.writeFailures === 0, 'Expected 0 failures');

  // Query all
  const all = await ledger.query();
  assert(all.length === 2, 'Expected 2 entries queried');
  assert(all[0].schemaVersion === 1, 'Expected schema version 1');
  assert(all[0].metadata.projectId === 'proj-1', 'Expected project ID match');

  // Query filtered
  const filtered = await ledger.query({ projectId: 'proj-2' });
  assert(filtered.length === 1, 'Expected 1 filtered entry');
  assert(filtered[0].metadata.sessionId === 'sess-2', 'Expected session ID match');

  ledger.stop();
  await cleanTempFile();
  console.log('[Test 1] Normal append and query: PASSED');
}

// ==============================================================================
// Test 2: Storage Failure Isolation
// ==============================================================================
async function testStorageFailureIsolation() {
  console.log('[Test 2] Storage failure isolation starting...');
  const clock = new SystemClock();
  const idProvider = new LedgerEntryIdProvider();
  const factory = new LedgerEntryFactory(clock, idProvider);
  const storage = new FaultyStorage();
  const eventBus = new RuntimeEventBus(new MockEventIdProvider());
  const ledger = new RuntimeLedger(storage, factory, eventBus);

  let busCrashed = false;
  try {
    eventBus.publish({
      eventId: 'evt-999',
      timestamp: Date.now(),
      type: 'WORKSPACE_LOCKED',
      source: 'WorkspaceRuntime',
      payload: {}
    });
  } catch (err) {
    busCrashed = true;
  }

  // Wait for async append resolution (up to 1500ms)
  const startTime = Date.now();
  while (ledger.getMetrics().writeFailures < 1 && Date.now() - startTime < 1500) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  assert(!busCrashed, 'Publishing to Event Bus should not crash on storage errors');

  const metrics = ledger.getMetrics();
  assert(metrics.totalEntries === 1, 'Should register entry attempt');
  assert(metrics.writeFailures === 1, 'Should record storage failure');
  assert(metrics.successfulWrites === 0, 'Successful writes should be 0');

  ledger.stop();
  console.log('[Test 2] Storage failure isolation: PASSED');
}

// ==============================================================================
// Test 3: Stop cleanup
// ==============================================================================
async function testStopCleanup() {
  console.log('[Test 3] Stop cleanup starting...');
  const clock = new SystemClock();
  const idProvider = new LedgerEntryIdProvider();
  const factory = new LedgerEntryFactory(clock, idProvider);
  const storage = new FileLedgerStorage(TEMP_LEDGER_FILE);
  const eventBus = new RuntimeEventBus(new MockEventIdProvider());
  const ledger = new RuntimeLedger(storage, factory, eventBus);

  ledger.stop();

  eventBus.publish({
    eventId: 'evt-unsubscribed',
    timestamp: Date.now(),
    type: 'LAUNCH_REQUESTED',
    source: 'Launcher',
    payload: {}
  });

  await new Promise((resolve) => setTimeout(resolve, 50));

  const metrics = ledger.getMetrics();
  assert(metrics.totalEntries === 0, 'Should not record entries after stop');

  await cleanTempFile();
  console.log('[Test 3] Stop cleanup: PASSED');
}

async function runAll() {
  console.log('--- Starting Runtime Ledger Foundation Unit Tests ---');
  await testNormalAppendAndQuery();
  await testStorageFailureIsolation();
  await testStopCleanup();
  console.log('--- All Runtime Ledger Foundation Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
