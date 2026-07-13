import { KnowledgeGovernanceOrchestrator } from '../../../src/knowledge/governance/KnowledgeGovernanceOrchestrator';
import { KnowledgeGovernanceRegistry } from '../../../src/knowledge/governance/KnowledgeGovernanceRegistry';
import { KnowledgeRuleRegistry } from '../../../src/knowledge/governance/KnowledgeRuleRegistry';
import { InMemoryKnowledgeRepository } from '../../../src/knowledge/repository/InMemoryKnowledgeRepository';
import { InMemoryKnowledgeSerialAllocator } from '../../../src/knowledge/governance/InMemoryKnowledgeSerialAllocator';
import { SequenceKnowledgeGovernancePolicy } from '../../../src/knowledge/governance/policies/SequenceKnowledgeGovernancePolicy';
import { MinimumNodesCountRule } from '../../../src/knowledge/governance/rules/MinimumNodesCountRule';
import { KnowledgeAsset, KnowledgeStatus } from '../../../src/knowledge/contracts';

async function runTests() {
  function assertEqual(actual: any, expected: any, message: string) {
    if (actual !== expected) {
      throw new Error(`[FAIL] ${message}\nExpected: ${expected}\nActual: ${actual}`);
    }
    console.log(`[PASS] ${message}`);
  }

  console.log("=== Running KnowledgeGovernanceOrchestrator Tests ===");

  const repo = new InMemoryKnowledgeRepository();
  const allocator = new InMemoryKnowledgeSerialAllocator();
  
  const ruleRegistry = new KnowledgeRuleRegistry();
  ruleRegistry.register(new MinimumNodesCountRule());

  const govRegistry = new KnowledgeGovernanceRegistry();
  govRegistry.register(new SequenceKnowledgeGovernancePolicy(ruleRegistry));

  const orchestrator = new KnowledgeGovernanceOrchestrator(
    govRegistry,
    repo,
    allocator
  );

  // 1. Node count passes rule evaluation
  const validDraft: KnowledgeAsset = Object.freeze({
    schemaVersion: '1.0.0',
    knowledgeId: 'KNW-DRAFT-VALID',
    version: 0,
    status: KnowledgeStatus.DRAFT,
    semantic: Object.freeze({
      nodes: Object.freeze([
        Object.freeze({ nodeId: 'N1', label: 'Node 1', type: 'STATE', properties: {} }),
        Object.freeze({ nodeId: 'N2', label: 'Node 2', type: 'STATE', properties: {} })
      ]),
      edges: Object.freeze([])
    }),
    logicalRules: Object.freeze([]),
    metadata: Object.freeze({
      sourcePatternIds: Object.freeze(['PAT-1']),
      createdAt: '2026-07-13T00:00:00Z',
      generatedBy: 'aios.knowledge.plugin.sequence',
      schemaVersion: '1.0.0'
    })
  });

  const res1 = await orchestrator.evaluateAndStore([validDraft]);
  assertEqual(res1.approvedCount, 1, "Orchestrator approved 1 valid asset");
  assertEqual(res1.rejectedCount, 0, "Orchestrator rejected 0 assets");
  assertEqual(res1.approvedAssets[0].knowledgeId, 'KNW-SEQ-000001', "Allocated official ID KNW-SEQ-000001");
  assertEqual(res1.decisions[0].decisionId.startsWith('DEC-K-'), true, "Generated deterministic decision ID DEC-K-[HASH]");
  assertEqual(res1.decisions[0].ruleCount, 1, "Checks rule count");
  assertEqual(res1.decisions[0].passedRuleCount, 1, "Checks passed rule count");

  // Verify saved in repository
  const saved = await repo.findById('KNW-SEQ-000001');
  assertEqual(saved.length, 1, "Asset successfully saved in Repository");

  // 2. Reject due to rule failure (only 1 node in semantic graph)
  const invalidDraft: KnowledgeAsset = Object.freeze({
    schemaVersion: '1.0.0',
    knowledgeId: 'KNW-DRAFT-INVALID',
    version: 0,
    status: KnowledgeStatus.DRAFT,
    semantic: Object.freeze({
      nodes: Object.freeze([
        Object.freeze({ nodeId: 'N1', label: 'Node 1', type: 'STATE', properties: {} })
      ]),
      edges: Object.freeze([])
    }),
    logicalRules: Object.freeze([]),
    metadata: Object.freeze({
      sourcePatternIds: Object.freeze(['PAT-2']),
      createdAt: '2026-07-13T00:00:00Z',
      generatedBy: 'aios.knowledge.plugin.sequence',
      schemaVersion: '1.0.0'
    })
  });

  const res2 = await orchestrator.evaluateAndStore([invalidDraft]);
  assertEqual(res2.approvedCount, 0, "Orchestrator approved 0 invalid assets");
  assertEqual(res2.rejectedCount, 1, "Orchestrator rejected 1 invalid asset");
  assertEqual(res2.decisions[0].approved, false, "Decision is approved=false");

  console.log("=== All KnowledgeGovernanceOrchestrator tests passed! ===");
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
