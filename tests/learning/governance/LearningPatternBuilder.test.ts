import { LearningPatternBuilder } from '../../../src/learning/governance/LearningPatternBuilder';
import { GovernanceDecision } from '../../../src/learning/governance/GovernanceDecision';
import { PatternEvaluation, LearningPattern, PatternStatus, PatternType } from '../../../src/learning/contracts';

async function runTests() {
  function assertEqual(actual: any, expected: any, message: string) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`[FAIL] ${message}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`);
    }
    console.log(`[PASS] ${message}`);
  }

  console.log("=== Running LearningPatternBuilder (Immutable) Tests ===");

  const discoveredPattern: LearningPattern = Object.freeze({
    schemaVersion: '1.0.0',
    patternId: 'PAT-TEST-001',
    version: 0,
    status: PatternStatus.DISCOVERED,
    createdAt: '2026-07-01T00:00:00Z',
    sourceDatasetIds: ['DS-1'],
    patternType: 'SEQUENCE',
    patternData: Object.freeze({ seq: ['A'] } as any),
    statistics: Object.freeze({ sampleCount: 10, occurrenceCount: 5 })
  });

  const decision: GovernanceDecision = Object.freeze({
    decisionId: 'DEC-123',
    approved: true,
    reason: 'ok',
    policyId: 'POL-1',
    ruleResults: []
  });

  const evaluation: PatternEvaluation = Object.freeze({
    confidence: 0.9,
    qualityScore: 90,
    trustLevel: 'HIGH',
    approvedAt: '2026-07-02T00:00:00Z'
  });

  const newPattern = LearningPatternBuilder.buildApproved(discoveredPattern, decision, evaluation);

  assertEqual(newPattern.status, PatternStatus.APPROVED, "New pattern must be APPROVED");
  assertEqual(newPattern.version, 1, "New pattern version must be 1 (incremented from 0)");
  assertEqual(newPattern.patternId, discoveredPattern.patternId, "ID must remain the same");
  assertEqual(newPattern.createdAt !== discoveredPattern.createdAt, true, "CreatedAt must be updated to approval time");
  assertEqual(newPattern !== discoveredPattern, true, "Builder must create a NEW instance (Immutable)");
  assertEqual(Object.isFrozen(newPattern), true, "New pattern must be frozen");
  assertEqual(newPattern.evaluation?.trustLevel, 'HIGH', "Evaluation must be attached");

  // Rejection Test
  const rejectedDecision: GovernanceDecision = { ...decision, approved: false };
  try {
    LearningPatternBuilder.buildApproved(discoveredPattern, rejectedDecision, evaluation);
    throw new Error("[FAIL] Should throw on REJECTED decision");
  } catch(e: any) {
    if (e.message.includes("Cannot build")) {
      console.log("[PASS] Builder correctly rejects REJECTED decisions");
    } else throw e;
  }

  console.log("=== All LearningPatternBuilder tests passed! ===");
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
