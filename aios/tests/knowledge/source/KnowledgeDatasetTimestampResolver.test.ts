import { KnowledgeDatasetTimestampResolver } from '../../knowledge/source/KnowledgeDatasetTimestampResolver';
import { LearningPattern, PatternStatus } from '../../learning/contracts';

async function runTests() {
  function assertEqual(actual: any, expected: any, message: string) {
    if (actual !== expected) {
      throw new Error(`[FAIL] ${message}\nExpected: ${expected}\nActual: ${actual}`);
    }
    console.log(`[PASS] ${message}`);
  }

  console.log("=== Running KnowledgeDatasetTimestampResolver Tests ===");

  // 1. Empty pattern array yields epoch
  const emptyTimestamp = KnowledgeDatasetTimestampResolver.resolve([]);
  assertEqual(emptyTimestamp, '1970-01-01T00:00:00Z', "Empty array returns 1970 Epoch");

  // 2. Resolver picks the latest createdAt timestamp
  const mockPatterns: LearningPattern[] = [
    {
      schemaVersion: '1',
      patternId: 'P1',
      patternType: 'SEQUENCE',
      status: PatternStatus.APPROVED,
      version: 1,
      createdAt: '2026-07-13T00:00:00Z',
      sourceDatasetIds: [],
      patternData: {} as any,
      statistics: {} as any
    },
    {
      schemaVersion: '1',
      patternId: 'P2',
      patternType: 'SEQUENCE',
      status: PatternStatus.APPROVED,
      version: 1,
      createdAt: '2026-07-13T05:00:00Z', // Latest
      sourceDatasetIds: [],
      patternData: {} as any,
      statistics: {} as any
    },
    {
      schemaVersion: '1',
      patternId: 'P3',
      patternType: 'SEQUENCE',
      status: PatternStatus.APPROVED,
      version: 1,
      createdAt: '2026-07-13T02:00:00Z',
      sourceDatasetIds: [],
      patternData: {} as any,
      statistics: {} as any
    }
  ];

  const resolved = KnowledgeDatasetTimestampResolver.resolve(mockPatterns);
  assertEqual(resolved, '2026-07-13T05:00:00.000Z', "Correctly selects latest createdAt");

  console.log("=== All KnowledgeDatasetTimestampResolver tests passed! ===");
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
