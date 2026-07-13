import { LedgerLearningSource } from '../../../../../../../sdk/core/aios/learning/source/sources/LedgerLearningSource';
import { SourceType } from '../../../../../../../sdk/core/aios/learning/source/SourceType';
import { LearningRequest } from '../../../../../../../sdk/core/aios/learning/source/LearningRequest';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

class MockLedgerReader {
  public dataMap = new Map<string, any>();
  async findByExecutionId(id: string) {
    return this.dataMap.get(id) || null;
  }
}

async function runTests() {
  console.log('Running LedgerLearningSource tests...');

  const reader = new MockLedgerReader();
  const source = new LedgerLearningSource(reader as any);

  // Setup mock ledger data
  reader.dataMap.set('EXEC-A', {
    entries: [
      { entryId: 'ENT-1', timestamp: '2026-07-12T12:00:00Z', payload: { action: 'Test-A' } },
      { entryId: 'ENT-2', timestamp: '2026-07-12T12:00:05Z', payload: { action: 'Test-B' } }
    ]
  });

  const request: LearningRequest = {
    requestId: 'REQ-1',
    sourceType: SourceType.LEDGER,
    executionId: 'EXEC-A',
    filters: {},
    schemaVersion: '1.0.0'
  };

  const dataset = await source.load(request);
  assert(dataset.metadata.recordCount === 2, 'Should load exactly 2 records');
  assert(dataset.records[0].recordId === 'ENT-1', 'First record ID matches log entryId');
  assert(dataset.records[0].payload['action'] === 'Test-A', 'Payload action aligns');

  // Test: Empty Dataset Test
  const reqEmpty: LearningRequest = {
    requestId: 'REQ-2',
    sourceType: SourceType.LEDGER,
    executionId: 'EXEC-NON-EXISTENT',
    filters: {},
    schemaVersion: '1.0.0'
  };

  const emptyDataset = await source.load(reqEmpty);
  assert(emptyDataset.metadata.recordCount === 0, 'Non-existent executionId should return empty dataset safely');

  console.log('All LedgerLearningSource tests passed!');
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
