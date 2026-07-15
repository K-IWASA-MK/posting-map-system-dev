import { SequencePatternExtractor } from '../../learning/plugins/sequence/SequencePatternExtractor';
import { LearningDataset, LearningRecord } from '../../learning/contracts/LearningDataset';

// Mock test framework for the walkthrough
function assertEqual(actual: any, expected: any, message: string) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`[FAIL] ${message}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`);
  }
  console.log(`[PASS] ${message}`);
}

const extractor = new SequencePatternExtractor();

function createDataset(types: string[]): LearningDataset {
  return {
    datasetId: 'ds-test',
    schemaVersion: '1.0.0',
    createdAt: new Date().toISOString(),
    records: types.map((type, i) => ({
      eventId: `evt-${i}`,
      type,
      timestamp: new Date().toISOString()
    }))
  };
}

console.log("=== Running SequenceExtractor Tests ===");

// 1. Single Event
{
  const ds = createDataset(['A']);
  assertEqual(extractor.supports(ds), false, "Single Event: supports() should be false");
  assertEqual(extractor.extract(ds), [], "Single Event: extract() should be empty");
}

// 2. Empty Dataset
{
  const ds = createDataset([]);
  assertEqual(extractor.supports(ds), false, "Empty Dataset: supports() should be false");
  assertEqual(extractor.extract(ds), [], "Empty Dataset: extract() should be empty");
}

// 3. Duplicate Transition & Canonical
{
  const ds = createDataset(['A', 'B', 'A', 'B']);
  assertEqual(extractor.supports(ds), true, "Duplicate: supports() should be true");
  
  const results = extractor.extract(ds);
  // Transitions: A->B, B->A, A->B
  assertEqual(results.length, 2, "Duplicate: Should extract 2 unique sequences");
  
  const ab = results.find(r => r.data.sequenceId === 'SEQ:A->B');
  const ba = results.find(r => r.data.sequenceId === 'SEQ:B->A');

  assertEqual(ab?.stats.occurrenceCount, 2, "Duplicate: A->B should have occurrenceCount 2");
  assertEqual(ba?.stats.occurrenceCount, 1, "Duplicate: B->A should have occurrenceCount 1");
  assertEqual(ab?.data.events, ['A', 'B'], "Canonical: A->B should have events ['A', 'B']");
}

// 4. Deterministic
{
  const ds = createDataset(['A', 'B', 'C']);
  const result1 = extractor.extract(ds);
  const result2 = extractor.extract(ds);
  assertEqual(result1, result2, "Deterministic: Identical datasets should produce identical deep results");
}

// 5. Order Preservation (A->B->C does not produce A->C)
{
  const ds = createDataset(['A', 'B', 'C']);
  const results = extractor.extract(ds);
  assertEqual(results.length, 2, "Order Preservation: Should extract A->B and B->C only");
  const ac = results.find(r => r.data.sequenceId === 'SEQ:A->C');
  assertEqual(ac, undefined, "Order Preservation: A->C should NOT be extracted");
}

console.log("=== All tests passed! ===");
