import * as fs from 'fs';
import * as path from 'path';
import { JsonExecutionLedgerAdapter } from '../../../../../../src/core/aios/ledger/JsonExecutionLedgerAdapter';
import { ExecutionLedgerEntryType } from '../../../../../../src/core/aios/ledger/ExecutionLedgerEntryType';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('Running JsonExecutionLedgerAdapter tests...');
  
  const testFile = path.join(__dirname, 'test_ledger.json');
  if (fs.existsSync(testFile)) {
    fs.unlinkSync(testFile);
  }

  const adapter = new JsonExecutionLedgerAdapter(testFile);

  await adapter.append({
    entryId: 'EVT-1',
    executionId: 'EXEC-1',
    correlationId: 'CORR-1',
    timestamp: new Date().toISOString(),
    entryType: ExecutionLedgerEntryType.SYSTEM,
    payload: { msg: 'Boot' },
    version: '1.0',
    sequenceNo: 1
  });

  await adapter.flush();

  assert(fs.existsSync(testFile), 'JSON file should be created');

  // Read back
  const reader = new JsonExecutionLedgerAdapter(testFile);
  const ledger = await reader.findByExecutionId('EXEC-1');
  
  assert(ledger !== null, 'Should retrieve ledger for EXEC-1');
  assert(ledger!.entries.length === 1, 'Ledger should have 1 entry');
  assert(ledger!.entries[0].entryId === 'EVT-1', 'Entry ID should match');

  // Cleanup
  if (fs.existsSync(testFile)) {
    fs.unlinkSync(testFile);
  }

  console.log('All JsonExecutionLedgerAdapter tests passed!');
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
