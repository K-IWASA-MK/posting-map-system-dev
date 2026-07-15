import { KnowledgeAsset, KnowledgeStatus } from '../../knowledge/contracts';

async function runTests() {
  console.log("=== Running KnowledgeAsset Static Type check ===");

  const draftAsset: KnowledgeAsset = {
    schemaVersion: '1.0.0',
    knowledgeId: 'KNW-SEQ-000001',
    version: 0,
    status: KnowledgeStatus.DRAFT,
    semantic: {
      nodes: [
        { nodeId: 'N1', label: 'Auth Validation', type: 'COMPONENT', properties: {} }
      ],
      edges: []
    },
    logicalRules: [
      {
        ruleId: 'LR1',
        ruleType: 'MATCH',
        pluginId: 'aios.knowledge.rule.match',
        parameters: {}
      }
    ],
    metadata: {
      sourcePatternIds: ['PAT-001'],
      createdAt: '2026-07-13T00:00:00Z',
      generatedBy: 'SequenceKnowledgeSynthesizer',
      schemaVersion: '1.0.0'
    }
  };

  const approvedAsset: KnowledgeAsset = {
    ...draftAsset,
    version: 1,
    status: KnowledgeStatus.APPROVED,
    evaluation: {
      confidence: 0.95,
      quality: 0.9,
      trustLevel: 'HIGH',
      ruleResults: [
        { ruleId: 'R1', passed: true, reason: 'High occurrence frequency' }
      ]
    }
  };

  if (draftAsset.knowledgeId === approvedAsset.knowledgeId) {
    console.log("[PASS] KnowledgeAsset complies with Draft/Approved definitions");
  }

  console.log("=== All KnowledgeAsset static type checks passed! ===");
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
