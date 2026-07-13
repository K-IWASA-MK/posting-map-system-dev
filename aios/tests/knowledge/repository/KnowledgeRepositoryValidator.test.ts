import { KnowledgeRepositoryValidator } from '../../knowledge/repository/KnowledgeRepositoryValidator';
import { KnowledgeAsset, KnowledgeStatus } from '../../knowledge/contracts';

async function runTests() {
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

  console.log("=== Running KnowledgeRepositoryValidator Tests ===");

  const validAsset: KnowledgeAsset = {
    schemaVersion: '1.0.0',
    knowledgeId: 'KNW-SEQ-000001',
    version: 1,
    status: KnowledgeStatus.APPROVED,
    semantic: {
      nodes: [{ nodeId: 'N1', label: 'Node 1', type: 'STATE', properties: {} }],
      edges: []
    },
    logicalRules: [],
    metadata: {
      sourcePatternIds: ['PAT-001'],
      createdAt: '2026-07-13T00:00:00Z',
      generatedBy: 'plugin-seq',
      schemaVersion: '1.0.0'
    },
    evaluation: {
      confidence: 0.9,
      quality: 0.95,
      trustLevel: 'HIGH',
      ruleResults: []
    }
  };

  // Deep freeze all parts for valid check
  Object.freeze(validAsset.semantic.nodes[0]);
  Object.freeze(validAsset.semantic.nodes);
  Object.freeze(validAsset.semantic.edges);
  Object.freeze(validAsset.semantic);
  Object.freeze(validAsset.metadata);
  Object.freeze(validAsset.logicalRules);
  Object.freeze(validAsset.evaluation);
  Object.freeze(validAsset);

  // 1. Valid Check
  try {
    KnowledgeRepositoryValidator.validate(validAsset);
    console.log("[PASS] Valid APPROVED frozen asset passes validation");
  } catch (e: any) {
    throw new Error(`[FAIL] Valid asset should have passed: ${e.message}`);
  }

  // 2. Reject unfrozen root
  const unfrozenAsset = { ...validAsset };
  // Note: we can't completely unfreeze a deeply frozen object easily without cloning all nested elements.
  // Let's clone cleanly to make root unfrozen.
  const rootUnfrozen: KnowledgeAsset = {
    schemaVersion: '1.0.0',
    knowledgeId: 'KNW-SEQ-000002',
    version: 1,
    status: KnowledgeStatus.APPROVED,
    semantic: Object.freeze({ nodes: [], edges: [] }),
    logicalRules: Object.freeze([]),
    metadata: Object.freeze({ sourcePatternIds: [], createdAt: '', generatedBy: '', schemaVersion: '' }),
    evaluation: Object.freeze({ confidence: 1, quality: 1, trustLevel: 'HIGH', ruleResults: [] })
  };
  assertThrows(
    () => KnowledgeRepositoryValidator.validate(rootUnfrozen),
    "must be frozen",
    "Fails validation when root is unfrozen"
  );

  // 3. Reject unfrozen semantic
  const semanticUnfrozen: KnowledgeAsset = Object.freeze({
    schemaVersion: '1.0.0',
    knowledgeId: 'KNW-SEQ-000002',
    version: 1,
    status: KnowledgeStatus.APPROVED,
    semantic: { nodes: [], edges: [] }, // unfrozen
    logicalRules: Object.freeze([]),
    metadata: Object.freeze({ sourcePatternIds: [], createdAt: '', generatedBy: '', schemaVersion: '' }),
    evaluation: Object.freeze({ confidence: 1, quality: 1, trustLevel: 'HIGH', ruleResults: [] })
  });
  assertThrows(
    () => KnowledgeRepositoryValidator.validate(semanticUnfrozen),
    "semantic must be frozen",
    "Fails validation when semantic property is unfrozen"
  );

  // 4. Reject DRAFT status
  const draftAsset: KnowledgeAsset = Object.freeze({
    schemaVersion: '1.0.0',
    knowledgeId: 'KNW-SEQ-000002',
    version: 0,
    status: KnowledgeStatus.DRAFT,
    semantic: Object.freeze({ nodes: [], edges: [] }),
    logicalRules: Object.freeze([]),
    metadata: Object.freeze({ sourcePatternIds: [], createdAt: '', generatedBy: '', schemaVersion: '' }),
    evaluation: Object.freeze({ confidence: 1, quality: 1, trustLevel: 'HIGH', ruleResults: [] })
  });
  assertThrows(
    () => KnowledgeRepositoryValidator.validate(draftAsset),
    "status must be APPROVED",
    "Fails validation when status is DRAFT"
  );

  // 5. Reject version < 1 for APPROVED
  const invalidVersionAsset: KnowledgeAsset = Object.freeze({
    schemaVersion: '1.0.0',
    knowledgeId: 'KNW-SEQ-000002',
    version: 0,
    status: KnowledgeStatus.APPROVED,
    semantic: Object.freeze({ nodes: [], edges: [] }),
    logicalRules: Object.freeze([]),
    metadata: Object.freeze({ sourcePatternIds: [], createdAt: '', generatedBy: '', schemaVersion: '' }),
    evaluation: Object.freeze({ confidence: 1, quality: 1, trustLevel: 'HIGH', ruleResults: [] })
  });
  assertThrows(
    () => KnowledgeRepositoryValidator.validate(invalidVersionAsset),
    "version must be >= 1",
    "Fails validation when version is 0 for APPROVED status"
  );

  console.log("=== All KnowledgeRepositoryValidator tests passed! ===");
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
