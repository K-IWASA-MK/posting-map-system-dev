import { KnowledgeId } from '../../knowledge/contracts/KnowledgeId';

async function runTests() {
  function assertEqual(actual: any, expected: any, message: string) {
    if (actual !== expected) {
      throw new Error(`[FAIL] ${message}\nExpected: ${expected}\nActual: ${actual}`);
    }
    console.log(`[PASS] ${message}`);
  }

  console.log("=== Running KnowledgeId Tests ===");

  // 1. Valid Generation
  const id = KnowledgeId.generate('SEQ', 1);
  assertEqual(id, 'KNW-SEQ-000001', "Generates correct ID with zero padding");

  const id2 = KnowledgeId.generate('cause', 99999);
  assertEqual(id2, 'KNW-CAUSE-099999', "Generates uppercase type and formats correctly");

  // 2. Validate valid ID
  try {
    KnowledgeId.validate('KNW-ANOMALY-123456');
    console.log("[PASS] Validates a correct ID format");
  } catch (e: any) {
    throw new Error(`[FAIL] Validation should have passed: ${e.message}`);
  }

  // 3. Invalid cases
  const invalidCases = [
    'KNW-SEQ-1',
    'KNW-seq-000001', // type must be uppercase
    'knw-SEQ-000001', // prefix must be uppercase
    'KNW-SEQ-00000a', // serial must be digits
    'SEQ-000001'      // missing KNW prefix
  ];

  for (const invalid of invalidCases) {
    try {
      KnowledgeId.validate(invalid);
      throw new Error(`[FAIL] Validation should have failed for: ${invalid}`);
    } catch (e: any) {
      console.log(`[PASS] Rejected invalid ID: ${invalid}`);
    }
  }

  console.log("=== All KnowledgeId tests passed! ===");
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
