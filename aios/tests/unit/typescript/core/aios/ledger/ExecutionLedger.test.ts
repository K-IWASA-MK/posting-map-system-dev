import { ExecutionLedgerEntry } from '../../../../../../sdk/core/aios/ledger/ExecutionLedgerEntry';
import { ExecutionLedgerEntryType } from '../../../../../../sdk/core/aios/ledger/ExecutionLedgerEntryType';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

function runTests() {
  console.log('Running ExecutionLedger tests...');
  
  const entry: ExecutionLedgerEntry = Object.freeze({
    entryId: 'EVT-1',
    executionId: 'EXEC-1',
    correlationId: 'CORR-1',
    timestamp: new Date().toISOString(),
    entryType: ExecutionLedgerEntryType.SYSTEM,
    payload: Object.freeze({ msg: 'Boot' }),
    version: '1.0',
    sequenceNo: 1
  });

  assert(entry.entryId === 'EVT-1', 'Entry should be readable');
  assert(entry.entryType === 'SYSTEM', 'Entry type should be SYSTEM');
  
  let threwError = false;
  try {
    // Check immutability
    (entry as any).sequenceNo = 2;
  } catch (e) {
    threwError = true;
  }
  assert(threwError, 'Should throw when mutating an immutable Entry');

  console.log('All ExecutionLedger tests passed!');
}

runTests();
