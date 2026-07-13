import { KnowledgeBuilder } from '../../../src/knowledge/governance/KnowledgeBuilder';
import { KnowledgeAsset, KnowledgeStatus } from '../../../src/knowledge/contracts';
import { GovernanceDecision } from '../../../src/knowledge/governance/GovernanceDecision';

async function runTests() {
  function assertEqual(actual: any, expected: any, message: string) {
    if (actual !== expected) {
      throw new Error(`[FAIL] ${message}\nExpected: ${expected}\nActual: ${actual}`);
    }
    console.log(`[PASS] ${message}`);
  }

  function assertThrows(fn: () => void, expectedMessageSub: string, message: string) {
    try {
      fn();
      throw new Error(`[FAIL] Expected to throw, but completed: ${message}`);
    } catch (e: any) {
      if (e.message.includes(expectedMessageSub)) {
        console.log(`[PASS] ${message} (Threw: ${e.message})`);
      } else {
        throw new Error(`[FAIL] ${message}\nExpected exception containing: "${expectedMessageSub}"\nActual: "${e.message}"`);
      }
    }
  }

  console.log("=== Running KnowledgeBuilder Tests ===");

  const mockDraft: KnowledgeAsset = {
    schemaVersion: '1.0.0',
    knowledgeId: 'KNW-DRAFT-123',
    version: 0,
    status: KnowledgeStatus.DRAFT,
    semantic: {
      nodes: [{ nodeId: 'N1', label: 'Node 1', type: 'STATE', properties: {} }],
      edges: []
    },
    logicalRules: [],
    metadata: {
      sourcePatternIds: ['PAT-1'],
      createdAt: '2026-07-13T00:00:00Z',
      generatedBy: 'aios.knowledge.plugin.sequence',
      schemaVersion: '1.0.0'
    }
  };

  const mockDecision: GovernanceDecision = {
    decisionId: 'DEC-1',
    approved: true,
    reason: 'Passed tests',
    policyId: 'POLICY-1',
    ruleResults: [],
    ruleCount: 0,
    passedRuleCount: 0
  };

  const mockEvaluation = {
    confidence: 0.9,
    quality: 0.8,
    trustLevel: 'HIGH',
    ruleResults: []
  };

  // 1. Valid approved build
  const approved = KnowledgeBuilder.buildApproved(mockDraft, mockDecision, mockEvaluation, 5);
  assertEqual(approved.status, KnowledgeStatus.APPROVED, "Status changes to APPROVED");
  assertEqual(approved.version, 1, "Version promoted to 1");
  assertEqual(approved.knowledgeId, 'KNW-SEQ-000005', "Official sequential ID allocated using KnowledgeId");
  assertEqual(approved.metadata.createdAt, '2026-07-13T00:00:00Z', "CreatedAt is deterministic (retained from draft)");

  // 2. Reject non-DRAFT
  const invalidDraft = { ...mockDraft, status: KnowledgeStatus.APPROVED };
  assertThrows(
    () => KnowledgeBuilder.buildApproved(invalidDraft, mockDecision, mockEvaluation, 5),
    "Must be DRAFT",
    "Throws if draft status is not DRAFT"
  );

  // 3. Reject build on rejected decision
  const rejectedDecision = { ...mockDecision, approved: false };
  assertThrows(
    () => KnowledgeBuilder.buildApproved(mockDraft, rejectedDecision, mockEvaluation, 5),
    "with a REJECTED decision",
    "Throws if decision is not approved"
  );

  console.log("=== All KnowledgeBuilder tests passed! ===");
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
