import { PatternQueryValidator } from '../../learning/query/PatternQueryValidator';
import { PatternQueryRequest } from '../../learning/query/PatternQueryRequest';

function assertThrows(fn: () => void, testName: string) {
  try {
    fn();
    throw new Error(`[FAIL] ${testName} - Expected an error to be thrown.`);
  } catch (err: any) {
    if (err.message.includes("Invalid")) {
      console.log(`[PASS] ${testName}`);
    } else {
      throw new Error(`[FAIL] ${testName} - Unexpected error: ${err.message}`);
    }
  }
}

function assertPasses(fn: () => void, testName: string) {
  try {
    fn();
    console.log(`[PASS] ${testName}`);
  } catch (err: any) {
    throw new Error(`[FAIL] ${testName} - Unexpected error: ${err.message}`);
  }
}

console.log("=== Running PatternQueryValidator Tests ===");

assertThrows(() => PatternQueryValidator.validate({ queryId: 'q1', schemaVersion: '1.0.0', limit: 0 }), "limit validation (0)");
assertThrows(() => PatternQueryValidator.validate({ queryId: 'q1', schemaVersion: '1.0.0', limit: -5 }), "limit validation (-5)");
assertThrows(() => PatternQueryValidator.validate({ queryId: 'q1', schemaVersion: '1.0.0', offset: -1 }), "offset validation (-1)");

assertThrows(
  () => PatternQueryValidator.validate({ 
    queryId: 'q1', schemaVersion: '1.0.0', 
    createdAfter: '2026-07-10T00:00:00Z', 
    createdBefore: '2026-07-09T00:00:00Z' 
  }), 
  "date range validation (after > before)"
);

assertPasses(() => PatternQueryValidator.validate({ queryId: 'q1', schemaVersion: '1.0.0', limit: 10, offset: 0 }), "Valid limit/offset");

console.log("=== All PatternQueryValidator tests passed! ===");
