import { SequenceGovernancePolicy } from '../../learning/governance/policies/SequenceGovernancePolicy';
import { RuleRegistry } from '../../learning/governance/RuleRegistry';
import { IGovernanceRule, RuleResult } from '../../learning/governance';
import { LearningPattern, PatternType, PatternStatus } from '../../learning/contracts';

async function runTests() {
  function assertEqual(actual: any, expected: any, message: string) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`[FAIL] ${message}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`);
    }
    console.log(`[PASS] ${message}`);
  }

  console.log("=== Running SequenceGovernancePolicy (Aggregation) Tests ===");

  const registry = new RuleRegistry();
  
  class MockRule implements IGovernanceRule {
    constructor(public ruleId: string, public forcePass: boolean) {}
    evaluate(stats: any): RuleResult {
      return { ruleId: this.ruleId, passed: this.forcePass, reason: this.forcePass ? 'ok' : 'fail' };
    }
  }

  registry.register(new MockRule('RULE-A', true));
  registry.register(new MockRule('RULE-B', true));
  registry.register(new MockRule('RULE-C', false));

  const policy = new SequenceGovernancePolicy(registry);

  const pattern: LearningPattern = {
    schemaVersion: '1.0.0',
    patternId: 'PAT-001',
    version: 0,
    status: PatternStatus.DISCOVERED,
    createdAt: new Date().toISOString(),
    sourceDatasetIds: ['DS-1'],
    patternType: 'SEQUENCE',
    patternData: {} as any,
    statistics: { occurrenceCount: 5, sampleCount: 10 }
  };

  const result = policy.evaluate(pattern);

  // Since Rule C fails, allPassed = false
  assertEqual(result.decision.approved, false, "Policy should REJECT if any rule fails");
  assertEqual(result.decision.ruleResults.length, 3, "Policy should evaluate all rules");
  assertEqual(result.decision.ruleResults.filter(r => r.passed).length, 2, "2 rules should pass");
  assertEqual(result.decision.ruleResults.filter(r => !r.passed).length, 1, "1 rule should fail");
  assertEqual(result.evaluation, undefined, "Evaluation should be undefined on failure");

  // Now make all rules pass
  const passRegistry = new RuleRegistry();
  passRegistry.register(new MockRule('RULE-A', true));
  passRegistry.register(new MockRule('RULE-B', true));
  passRegistry.register(new MockRule('RULE-C', true));

  const passPolicy = new SequenceGovernancePolicy(passRegistry);
  const passResult = passPolicy.evaluate(pattern);

  assertEqual(passResult.decision.approved, true, "Policy should APPROVE if all rules pass");
  assertEqual(passResult.evaluation !== undefined, true, "Evaluation must exist on approval");
  assertEqual(passResult.evaluation?.trustLevel, 'HIGH', "Trust level should be calculated based on stats");
  assertEqual(passResult.evaluation?.qualityScore, 99, "Quality score should be maxed (99) due to high occurrence");

  console.log("=== All SequenceGovernancePolicy tests passed! ===");
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
