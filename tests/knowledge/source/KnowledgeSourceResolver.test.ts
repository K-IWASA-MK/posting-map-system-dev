import { KnowledgeSourceFactory } from '../../knowledge/source/KnowledgeSourceFactory';
import { IPatternQueryService, PatternQueryRequest, PatternQueryResult } from '../../learning/query';
import { KnowledgeRequest } from '../../knowledge/contracts';
import { PatternStatus } from '../../learning/contracts';

async function runTests() {
  function assertEqual(actual: any, expected: any, message: string) {
    if (actual !== expected) {
      throw new Error(`[FAIL] ${message}\nExpected: ${expected}\nActual: ${actual}`);
    }
    console.log(`[PASS] ${message}`);
  }

  console.log("=== Running KnowledgeSourceResolver Tests ===");

  // Mock Query Service
  class MockQueryService implements IPatternQueryService {
    public queryReceivedRequest: any = null;
    public mockPatterns: any[] = [];

    async query(request: PatternQueryRequest): Promise<PatternQueryResult> {
      this.queryReceivedRequest = request;
      return {
        requestId: request.queryId,
        resultId: 'RES-001',
        schemaVersion: '1.0.0',
        generatedAt: '2026-07-13T00:00:00Z',
        patterns: this.mockPatterns,
        totalCount: this.mockPatterns.length,
        returnedCount: this.mockPatterns.length,
        hasNextPage: false
      };
    }
    async findById(): Promise<any> { return []; }
    async findByType(): Promise<any> { return []; }
    async findLatestVersion(): Promise<any> { return undefined; }
    async findAll(): Promise<any> { return []; }
  }

  const queryService = new MockQueryService();
  queryService.mockPatterns = [
    {
      schemaVersion: '1',
      patternId: 'P-1',
      patternType: 'SEQUENCE',
      status: PatternStatus.APPROVED,
      version: 1,
      createdAt: '2026-07-13T01:00:00Z',
      sourceDatasetIds: ['DS-1'],
      patternData: {} as any,
      statistics: {} as any
    }
  ];

  const resolver = KnowledgeSourceFactory.create(queryService, { maxPatternsLimit: 10 });

  const request: KnowledgeRequest = {
    schemaVersion: '1.0.0',
    requestId: 'REQ-12345',
    filters: { patternType: 'SEQUENCE' }
  };

  const result = await resolver.resolve(request);

  assertEqual(result.requestId, 'REQ-12345', "Returns original requestId");
  assertEqual(result.patternCount, 1, "Resolved correct pattern count");
  assertEqual(queryService.queryReceivedRequest.patternType, 'SEQUENCE', "Propagates type filter safely");

  // Empty edge-case test
  queryService.mockPatterns = [];
  const emptyResult = await resolver.resolve(request);
  assertEqual(emptyResult.patternCount, 0, "Correctly handles empty results without crashing");

  console.log("=== All KnowledgeSourceResolver tests passed! ===");
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
