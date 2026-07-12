import { ExecutionRecorder } from '../../../../../../src/core/aios/ledger/ExecutionRecorder';
import { JsonExecutionLedgerAdapter } from '../../../../../../src/core/aios/ledger/JsonExecutionLedgerAdapter';
import { ExecutionLedgerEntryType } from '../../../../../../src/core/aios/ledger/ExecutionLedgerEntryType';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('Running ExecutionRecorder tests...');
  
  const adapter = new JsonExecutionLedgerAdapter('/tmp/dummy.json'); // In-memory
  const recorder = new ExecutionRecorder(adapter, 'EXEC-100', 'CORR-100');

  const ev1 = await recorder.record(ExecutionLedgerEntryType.SYSTEM, { msg: 'Start' });
  const ev2 = await recorder.record(ExecutionLedgerEntryType.VALIDATION, { res: 'OK' });
  const ev3 = await recorder.record(ExecutionLedgerEntryType.DECISION, { dec: 'PASS' });

  assert(ev1 !== undefined, 'Should return entry id');
  
  const ledger = await adapter.findByExecutionId('EXEC-100');
  assert(ledger!.entries.length === 3, 'Should have recorded 3 events');

  assert(ledger!.entries[0].sequenceNo === 1, '1st sequence = 1');
  assert(ledger!.entries[1].sequenceNo === 2, '2nd sequence = 2');
  assert(ledger!.entries[2].sequenceNo === 3, '3rd sequence = 3');

  assert(ledger!.entries[1].parentEntryId === ledger!.entries[0].entryId, '2nd event parent should point to 1st event');
  assert(ledger!.entries[2].parentEntryId === ledger!.entries[1].entryId, '3rd event parent should point to 2nd event');

  console.log('All ExecutionRecorder tests passed!');
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
