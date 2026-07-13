import { KnowledgeDatasetIdGenerator } from '../../knowledge/source/KnowledgeDatasetIdGenerator';

async function runTests() {
  function assertEqual(actual: any, expected: any, message: string) {
    if (actual !== expected) {
      throw new Error(`[FAIL] ${message}\nExpected: ${expected}\nActual: ${actual}`);
    }
    console.log(`[PASS] ${message}`);
  }

  console.log("=== Running KnowledgeDatasetIdGenerator Tests ===");

  // 1. Same elements in different order yield the same KDS hash ID
  const id1 = KnowledgeDatasetIdGenerator.generate(['P-001', 'P-002', 'P-003']);
  const id2 = KnowledgeDatasetIdGenerator.generate(['P-003', 'P-001', 'P-002']);

  assertEqual(id1, id2, "Order permutation yields identical datasetId");
  assertEqual(id1.startsWith('KDS-'), true, "ID starts with KDS- prefix");
  assertEqual(id1.length, 20, "ID length is exactly 20 characters (KDS- + 16 chars hash)");

  // 2. Different elements yield different IDs
  const id3 = KnowledgeDatasetIdGenerator.generate(['P-001', 'P-002']);
  const id4 = KnowledgeDatasetIdGenerator.generate(['P-001', 'P-004']);
  if (id3 === id4) {
    throw new Error("[FAIL] Different patterns must yield different datasetIds");
  } else {
    console.log("[PASS] Different patterns yield unique datasetIds");
  }

  console.log("=== All KnowledgeDatasetIdGenerator tests passed! ===");
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
