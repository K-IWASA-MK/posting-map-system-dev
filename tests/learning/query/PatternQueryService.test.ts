import { PatternQueryService } from '../../learning/query/PatternQueryService';
import { PatternRepositoryFactory } from '../../learning/repository/PatternRepositoryFactory';
import { LearningPattern, PatternStatus } from '../../learning/contracts';

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

  console.log("=== Running PatternQueryService Tests ===");

  PatternRepositoryFactory.reset();
  const repo = PatternRepositoryFactory.getRepository();
  const service = new PatternQueryService(repo);

  // Setup Data
  await repo.save(createMockPattern('PAT-001', 'SEQUENCE', 1));
  await repo.save(createMockPattern('PAT-001', 'SEQUENCE', 2));
  await repo.save(createMockPattern('PAT-001', 'SEQUENCE', 5));
  
  for (let i = 1; i <= 25; i++) {
    await repo.save(createMockPattern(`PAT-ANO-${i}`, 'ANOMALY', 1));
  }

  // Query by PatternType Test
  const seqRes = await service.query({ queryId: 'q-seq', schemaVersion: '1.0.0', patternType: 'SEQUENCE' });
  assertEqual(seqRes.returnedCount, 3, "Query by PatternType: Should return only SEQUENCE patterns");
  assertEqual(seqRes.patterns.every(p => p.patternType === 'SEQUENCE'), true, "Query by PatternType: All returned patterns must be SEQUENCE");

  // Latest Version Test (v1, v2, v5 -> v5)
  const latest = await service.findLatestVersion('PAT-001');
  assertEqual(latest?.version, 5, "Latest Version Test: Should return v5 for PAT-001");

  // Pagination Test
  const pageRes = await service.query({ queryId: 'q-page', schemaVersion: '1.0.0', patternType: 'ANOMALY', limit: 10, offset: 20 });
  assertEqual(pageRes.returnedCount, 5, "Pagination Test: offset 20, limit 10 should return 5 remaining items");
  assertEqual(pageRes.hasNextPage, false, "Pagination Test: hasNextPage should be false");
  assertEqual(pageRes.patterns[0].patternId, 'PAT-ANO-21', "Pagination Test: Should start with PAT-ANO-21");

  const pageRes2 = await service.query({ queryId: 'q-page2', schemaVersion: '1.0.0', patternType: 'ANOMALY', limit: 10, offset: 0 });
  assertEqual(pageRes2.returnedCount, 10, "Pagination Test: offset 0, limit 10 should return 10 items");
  assertEqual(pageRes2.hasNextPage, true, "Pagination Test: hasNextPage should be true");
  assertEqual(pageRes2.nextOffset, 10, "Pagination Test: nextOffset should be 10");

  // Empty Result Test
  const emptyRes = await service.query({ queryId: 'q-empty', schemaVersion: '1.0.0', patternId: 'NON-EXISTENT' });
  assertEqual(emptyRes.returnedCount, 0, "Empty Result Test: Should return 0 items safely");
  assertEqual(emptyRes.patterns.length, 0, "Empty Result Test: Should have empty patterns array");

  // Immutable Test
  try {
    (emptyRes.patterns as any).push({});
    throw new Error("[FAIL] Immutable Test: Array mutation should throw error");
  } catch (e: any) {
    if (e.message.includes("extensible") || e.message.includes("read only") || e.name === "TypeError") {
      console.log("[PASS] Immutable Test: result.patterns is immutable");
    } else {
      throw e;
    }
  }

  console.log("=== All PatternQueryService tests passed! ===");
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
