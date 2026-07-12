import { LearningPipelineFactory } from '../../../src/learning/pipeline/LearningPipelineFactory';
import { LearningEngine } from '../../../src/learning/pipeline/LearningEngine';
import { ILearningSourceResolver } from '../../../src/learning/source';
import { IPatternDiscovery, PatternDiscoveryResult } from '../../../src/learning/discovery';
import { LearningDataset, LearningRequest, LearningPattern, PatternStatus } from '../../../src/learning/contracts';
import { PipelineStatus } from '../../../src/learning/pipeline/PipelineStatus';
import { IGovernanceOrchestrator, GovernanceResult } from '../../../src/learning/governance';

async function runTests() {
  function assertEqual(actual: any, expected: any, message: string) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`[FAIL] ${message}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`);
    }
    console.log(`[PASS] ${message}`);
  }

  console.log("=== Running LearningPipeline Tests ===");

  // Mock Discovery
  class MockDiscovery implements IPatternDiscovery {
    public throwError = false;
    discoverAll(dataset: LearningDataset): PatternDiscoveryResult {
      if (this.throwError) {
        throw new Error("Discovery failed!");
      }
      return Object.freeze({
        patterns: Object.freeze([
          { type: 'SEQUENCE' as any, data: { seq: ['A', 'B'] } as any, stats: {} as any },
          { type: 'ANOMALY' as any, data: { anom: 'X' } as any, stats: {} as any }
        ]),
        pluginCount: 2,
        skippedPlugins: 0,
        durationMs: 10
      });
    }
  }

  // Mock Resolver
  class MockResolver implements ILearningSourceResolver {
    public async resolve(request: LearningRequest): Promise<LearningDataset> {
      return Object.freeze({
        datasetId: 'DS-MOCK-1',
        schemaVersion: '1.0.0',
        createdAt: new Date().toISOString(),
        records: []
      });
    }
  }

  // Mock Orchestrator
  class MockOrchestrator implements IGovernanceOrchestrator {
    public async evaluateAndStore(patterns: ReadonlyArray<LearningPattern>): Promise<GovernanceResult> {
      // Simulate that all DISCOVERED patterns get APPROVED and version 1
      const approvedPatterns = patterns.map(p => ({
        ...p,
        version: 1,
        status: PatternStatus.APPROVED,
        evaluation: { confidence: 0.9, qualityScore: 90, trustLevel: 'HIGH', approvedAt: '' }
      }));
      return Object.freeze({
        approvedPatterns,
        rejectedPatterns: [],
        decisions: [],
        durationMs: 5
      });
    }
  }

  const discovery = new MockDiscovery();
  const engine = new LearningEngine(discovery);
  const resolver = new MockResolver();
  const orchestrator = new MockOrchestrator();
  const pipeline = LearningPipelineFactory.create({ resolver, engine, orchestrator });

  const request: LearningRequest = {
    schemaVersion: '1.0.0',
    requestId: 'REQ-123',
    sourceType: 'BIGQUERY',
    filters: []
  };

  // Test 1: Successful Pipeline Execution
  const result = await pipeline.run(request);
  
  assertEqual(result.status, PipelineStatus.SUCCESS, "Pipeline should return SUCCESS");
  assertEqual(result.requestId, 'REQ-123', "Pipeline should preserve requestId");
  assertEqual(result.datasetId, 'DS-MOCK-1', "Pipeline should extract datasetId from resolver");
  assertEqual(result.patternCount, 2, "Pipeline should extract 2 patterns");
  assertEqual(result.patterns.length, 2, "Pipeline should return 2 APPROVED patterns");
  assertEqual(result.patterns[0].status, 'APPROVED', "Patterns must be in APPROVED status");
  assertEqual(result.patterns[0].version, 1, "Patterns must be version 1");
  assertEqual(result.patterns[0].patternType, 'SEQUENCE', "Pattern type should match discovery output");

  // Test 2: Failure Handling
  discovery.throwError = true;
  const failResult = await pipeline.run(request);
  
  assertEqual(failResult.status, PipelineStatus.FAILED, "Pipeline should return FAILED on error");
  assertEqual(failResult.patternCount, 0, "Failed pipeline should have 0 patterns");
  assertEqual(failResult.patterns.length, 0, "Failed pipeline should return empty array safely");

  console.log("=== All LearningPipeline tests passed! ===");
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
