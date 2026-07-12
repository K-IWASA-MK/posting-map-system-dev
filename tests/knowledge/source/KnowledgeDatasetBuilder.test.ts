import { KnowledgeDatasetBuilder } from '../../../src/knowledge/source/KnowledgeDatasetBuilder';
import { KnowledgeDatasetMetadataFactory } from '../../../src/knowledge/source/KnowledgeDatasetMetadataFactory';
import { LearningPattern, PatternStatus } from '../../../src/learning/contracts';

async function runTests() {
  function assertEqual(actual: any, expected: any, message: string) {
    if (actual !== expected) {
      throw new Error(`[FAIL] ${message}\nExpected: ${expected}\nActual: ${actual}`);
    }
    console.log(`[PASS] ${message}`);
  }

  console.log("=== Running KnowledgeDatasetBuilder Tests ===");

  const mockPatterns: LearningPattern[] = [
    {
      schemaVersion: '1',
      patternId: 'P-002',
      patternType: 'SEQUENCE',
      status: PatternStatus.APPROVED,
      version: 1,
      createdAt: '2026-07-13T02:00:00Z',
      sourceDatasetIds: ['DS-1'],
      patternData: {} as any,
      statistics: {} as any
    },
    {
      schemaVersion: '1',
      patternId: 'P-001',
      patternType: 'SEQUENCE',
      status: PatternStatus.APPROVED,
      version: 1,
      createdAt: '2026-07-13T00:00:00Z',
      sourceDatasetIds: ['DS-1', 'DS-2'],
      patternData: {} as any,
      statistics: {} as any
    }
  ];

  const metadata = KnowledgeDatasetMetadataFactory.create(mockPatterns, '1.0.0');

  // 1. Build and verify sort order by patternId (default)
  const dataset = KnowledgeDatasetBuilder.create()
    .patterns(mockPatterns)
    .metadata(metadata)
    .build('patternId');

  assertEqual(dataset.patterns[0].patternId, 'P-001', "Canonical sorting by patternId");
  assertEqual(dataset.patterns[1].patternId, 'P-002', "Canonical sorting by patternId");
  assertEqual(dataset.metadata.recordCount, 2, "recordCount is correct");
  assertEqual(dataset.metadata.sourceCount, 2, "sourceCount is correct (uniqued)");
  assertEqual(dataset.metadata.patternTypes.length, 1, "patternTypes has sequence type");
  assertEqual(dataset.metadata.patternTypes[0], 'SEQUENCE', "patternTypes has SEQUENCE");

  // 2. Verify sort order by createdAt
  const datasetSortedByTime = KnowledgeDatasetBuilder.create()
    .patterns(mockPatterns)
    .metadata(metadata)
    .build('createdAt');
  assertEqual(datasetSortedByTime.patterns[0].patternId, 'P-001', "Time sorting: first pattern");
  assertEqual(datasetSortedByTime.patterns[1].patternId, 'P-002', "Time sorting: second pattern");

  // 3. Immutability check
  assertEqual(Object.isFrozen(dataset), true, "Dataset root is frozen");
  assertEqual(Object.isFrozen(dataset.metadata), true, "Metadata is frozen");
  assertEqual(Object.isFrozen(dataset.patterns), true, "Patterns array is frozen");
  assertEqual(Object.isFrozen(dataset.patterns[0]), true, "First pattern inside array is frozen");

  try {
    (dataset as any).metadata = {} as any;
    throw new Error("[FAIL] Allowed modifying dataset metadata");
  } catch(e) {
    console.log("[PASS] Modifying metadata is blocked (Immutable)");
  }

  console.log("=== All KnowledgeDatasetBuilder tests passed! ===");
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
