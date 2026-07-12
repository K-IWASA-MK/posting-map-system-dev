import { GovernanceOrchestrator, GovernanceRegistry, IGovernancePolicy, PolicyEvaluationResult } from '../../../src/learning/governance';
import { IPatternRepository } from '../../../src/learning/repository/IPatternRepository';
import { LearningPattern, PatternType, PatternStatus } from '../../../src/learning/contracts';

async function runTests() {
  function assertEqual(actual: any, expected: any, message: string) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`[FAIL] ${message}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`);
    }
    console.log(`[PASS] ${message}`);
  }

  console.log("=== Running GovernanceOrchestrator Tests ===");

  class MockRepo implements IPatternRepository {
    public savedPatterns: LearningPattern[] = [];
    async save(pattern: LearningPattern): Promise<void> {
      this.savedPatterns.push(pattern);
    }
    async findById(patternId: string): Promise<readonly LearningPattern[]> { return []; }
    async findByType(patternType: PatternType): Promise<readonly LearningPattern[]> { return []; }
    async findAll(): Promise<readonly LearningPattern[]> { return []; }
    async count(): Promise<number> { return this.savedPatterns.length; }
  }

  class MockPolicy implements IGovernancePolicy {
    public policyId = 'MOCK-POL';
    public targetPatternType = 'SEQUENCE';
    public forceApprove = false;
    evaluate(pattern: LearningPattern): PolicyEvaluationResult {
      return {
        decision: {
          decisionId: 'D1', approved: this.forceApprove, reason: '', policyId: 'P1', ruleResults: []
        },
        evaluation: this.forceApprove ? { confidence: 1, qualityScore: 100, trustLevel: 'HIGH', approvedAt: '' } : undefined
      };
    }
  }

  const repo = new MockRepo();
  const registry = new GovernanceRegistry();
  const policy = new MockPolicy();
  registry.register(policy);
  const orchestrator = new GovernanceOrchestrator(registry, repo);

  const pattern1: LearningPattern = {
    schemaVersion: '1.0.0', patternId: 'P1', version: 0, status: PatternStatus.DISCOVERED,
    createdAt: '', sourceDatasetIds: [], patternType: 'SEQUENCE', patternData: {} as any, statistics: {} as any
  };

  const pattern2: LearningPattern = {
    schemaVersion: '1.0.0', patternId: 'P2', version: 0, status: PatternStatus.DISCOVERED,
    createdAt: '', sourceDatasetIds: [], patternType: 'ANOMALY', patternData: {} as any, statistics: {} as any
  };

  policy.forceApprove = true;
  
  // P1 is SEQUENCE (will be approved). P2 is ANOMALY (no policy -> implicitly rejected).
  const result = await orchestrator.evaluateAndStore([pattern1, pattern2]);

  assertEqual(result.approvedPatterns.length, 1, "Should approve exactly 1 pattern (SEQUENCE)");
  assertEqual(result.rejectedPatterns.length, 1, "Should reject exactly 1 pattern (ANOMALY - no policy)");
  assertEqual(result.decisions.length, 2, "Should generate 2 decisions");
  
  assertEqual(repo.savedPatterns.length, 1, "Repository should contain exactly 1 saved pattern");
  assertEqual(repo.savedPatterns[0].patternId, 'P1', "Only P1 should be saved");
  assertEqual(repo.savedPatterns[0].version, 1, "Saved pattern must have version 1");
  assertEqual(repo.savedPatterns[0].status, PatternStatus.APPROVED, "Saved pattern must be APPROVED");

  console.log("=== All GovernanceOrchestrator tests passed! ===");
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
