import { InMemoryPatternRepository } from '../../../src/learning/repository/InMemoryPatternRepository';
import { PatternRepositoryError } from '../../../src/learning/repository/PatternRepositoryError';
import { LearningPattern, PatternStatus } from '../../../src/learning/contracts';

async function runTests() {
  function assertEqual(actual: any, expected: any, message: string) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`[FAIL] ${message}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`);
    }
    console.log(`[PASS] ${message}`);
  }

  const createMockPattern = (id: string, type: string, version: number): LearningPattern => {
    return Object.freeze({
      schemaVersion: '1.0.0',
      patternId: id,
      version,
      status: PatternStatus.APPROVED,
      createdAt: new Date().toISOString(),
      sourceDatasetIds: ['ds-1'],
      patternType: type as any,
      patternData: Object.freeze({ type } as any),
      statistics: Object.freeze({ sampleCount: 10, occurrenceCount: 5 }),
      evaluation: Object.freeze({
        confidence: 0.9,
        qualityScore: 90,
        trustLevel: 'HIGH',
        approvedAt: new Date().toISOString()
      })
    });
  };

  console.log("=== Running InMemoryPatternRepository Tests ===");

  const repo = new InMemoryPatternRepository();

  // Save Test
  const p1v1 = createMockPattern('PAT-SEQ-001', 'SEQUENCE', 1);
  await repo.save(p1v1);
  assertEqual(await repo.count(), 1, "Save Test: Should save 1 pattern");

  // Version Test
  const p1v2 = createMockPattern('PAT-SEQ-001', 'SEQUENCE', 2);
  await repo.save(p1v2);
  assertEqual(await repo.count(), 2, "Version Test: Should save v2 alongside v1");

  // Duplicate Test
  try {
    await repo.save(p1v1);
    throw new Error("[FAIL] Duplicate Test: Expected an error to be thrown.");
  } catch (err: any) {
    if (err instanceof PatternRepositoryError) {
      console.log(`[PASS] Duplicate Test: Rejected duplicate version properly.`);
    } else {
      throw err;
    }
  }
  assertEqual(await repo.count(), 2, "Duplicate Test: Count should remain 2");

  // Query Test (findById)
  const resultsById = await repo.findById('PAT-SEQ-001');
  assertEqual(resultsById.length, 2, "Query Test (findById): Should return both versions");
  assertEqual(resultsById[0].version, 1, "Query Test (findById): v1 should be first");
  assertEqual(resultsById[1].version, 2, "Query Test (findById): v2 should be second");

  // Query Test (findByType)
  const p2v1 = createMockPattern('PAT-ANOMALY-001', 'ANOMALY', 1);
  await repo.save(p2v1);
  
  const seqResults = await repo.findByType('SEQUENCE');
  assertEqual(seqResults.length, 2, "Query Test (findByType SEQUENCE): Should return 2 patterns");
  
  const anomalyResults = await repo.findByType('ANOMALY');
  assertEqual(anomalyResults.length, 1, "Query Test (findByType ANOMALY): Should return 1 pattern");

  // FindAll Test
  const allResults = await repo.findAll();
  assertEqual(allResults.length, 3, "FindAll Test: Should return all 3 stored patterns");

  console.log("=== All InMemoryPatternRepository tests passed! ===");
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
