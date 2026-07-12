import { KnowledgeSourceFactory } from '../../../src/knowledge/source/KnowledgeSourceFactory';
import { IPatternQueryService, PatternQueryRequest, PatternQueryResult } from '../../../src/learning/query';
import { KnowledgeRequest } from '../../../src/knowledge/contracts';
import { PatternStatus } from '../../../src/learning/contracts';

async function runTests() {
  function assertEqual(actual: any, expected: any, message: string) {
    if (actual !== expected) {
      throw new Error(`[FAIL] ${message}\nExpected: ${expected}\nActual: ${actual}`);
    }
    console.log(`[PASS] ${message}`);
  }

  console.log("=== Running KnowledgeDiscoveryDeterministic Tests ===");

  class MockQueryService implements IPatternQueryService {
    async query(request: PatternQueryRequest): Promise<PatternQueryResult> {
      return {
        requestId: request.queryId,
        resultId: 'R-001',
        schemaVersion: '1.0.0',
        generatedAt: '2026-07-13T00:00:00Z',
        patterns: [
          {
            schemaVersion: '1.0.0',
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
            schemaVersion: '1.0.0',
            patternId: 'P-001',
            patternType: 'SEQUENCE',
            status: PatternStatus.APPROVED,
            version: 1,
            createdAt: '2026-07-13T00:00:00Z',
            sourceDatasetIds: ['DS-2'],
            patternData: {} as any,
            statistics: {} as any
          }
        ],
        totalCount: 2,
        returnedCount: 2,
        hasNextPage: false
      };
    }
    async findById(): Promise<any> { return []; }
    async findByType(): Promise<any> { return []; }
    async findLatestVersion(): Promise<any> { return undefined; }
    async findAll(): Promise<any> { return []; }
  }

  const queryService = new MockQueryService();
  const resolver = KnowledgeSourceFactory.create(queryService);

  const request: KnowledgeRequest = {
    schemaVersion: '1.0.0',
    requestId: 'REQ-DET-123',
    filters: {}
  };

  // Run 100 times to verify deterministic behaviour (id, timestamps, pattern sort)
  const firstResult = await resolver.resolve(request);
  
  for (let i = 0; i < 100; i++) {
    const loopResult = await resolver.resolve(request);
    
    assertEqual(loopResult.datasetId, firstResult.datasetId, `[Iter ${i}] Same datasetId`);
    assertEqual(loopResult.dataset.metadata.generatedAt, firstResult.dataset.metadata.generatedAt, `[Iter ${i}] Same generatedAt`);
    assertEqual(loopResult.dataset.patterns[0].patternId, 'P-001', `[Iter ${i}] Correct sorted index 0`);
    assertEqual(loopResult.dataset.patterns[1].patternId, 'P-002', `[Iter ${i}] Correct sorted index 1`);
  }

  console.log("=== All KnowledgeDiscoveryDeterministic tests passed! ===");
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
