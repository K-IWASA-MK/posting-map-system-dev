import { KnowledgeEngine } from '../../knowledge/engine/KnowledgeEngine';
import { KnowledgeDiscovery } from '../../knowledge/engine/KnowledgeDiscovery';
import { KnowledgeRegistry } from '../../knowledge/engine/KnowledgeRegistry';
import { SequenceKnowledgePlugin } from '../../knowledge/engine/plugins/sequence/SequenceKnowledgePlugin';
import { KnowledgeDataset, KnowledgeStatus } from '../../knowledge/contracts';
import { PatternStatus } from '../../learning/contracts';

async function runTests() {
  function assertEqual(actual: any, expected: any, message: string) {
    if (actual !== expected) {
      throw new Error(`[FAIL] ${message}\nExpected: ${expected}\nActual: ${actual}`);
    }
    console.log(`[PASS] ${message}`);
  }

  console.log("=== Running KnowledgeEngine Tests ===");

  const registry = new KnowledgeRegistry();
  registry.register(new SequenceKnowledgePlugin());
  
  const discovery = new KnowledgeDiscovery(registry);
  const engine = new KnowledgeEngine(discovery);

  const mockDataset: KnowledgeDataset = {
    metadata: {
      datasetId: 'KDS-TEST',
      recordCount: 2,
      sourceCount: 1,
      generatedAt: '2026-07-13T00:00:00.000Z',
      schemaVersion: '1.0.0',
      patternTypes: ['SEQUENCE']
    },
    patterns: [
      {
        schemaVersion: '1.0.0',
        patternId: 'PAT-SEQ-001',
        patternType: 'SEQUENCE',
        status: PatternStatus.APPROVED,
        version: 1,
        createdAt: '2026-07-13T00:00:00.000Z',
        sourceDatasetIds: ['DS-1'],
        patternData: {
          type: 'SEQUENCE',
          sequenceId: 'SEQ:A->B',
          events: ['A', 'B'],
          length: 2
        } as any,
        statistics: {
          sampleCount: 10,
          occurrenceCount: 5
        }
      }
    ]
  };

  const assets = await engine.synthesize(mockDataset);
  
  assertEqual(assets.length, 1, "Synthesizes one asset");
  assertEqual(assets[0].version, 0, "Synthesized draft is version 0");
  assertEqual(assets[0].status, KnowledgeStatus.DRAFT, "Synthesized draft is DRAFT status");
  assertEqual(assets[0].knowledgeId.startsWith('KNW-DRAFT-'), true, "Temporary ID KNW-DRAFT-[hash]");
  assertEqual(assets[0].metadata.sourcePatternIds[0], 'PAT-SEQ-001', "Source pattern traces are mapped correctly");
  assertEqual(assets[0].semantic.nodes.length, 2, "Two semantic state nodes synthesized");
  assertEqual(assets[0].semantic.edges.length, 1, "One transition edge synthesized");
  assertEqual(assets[0].logicalRules.length, 1, "One transition guard rule synthesized");
  assertEqual(assets[0].logicalRules[0].parameters['triggerEvent'], 'A', "Rules parameters are correct");
  assertEqual(assets[0].logicalRules[0].parameters['nextEvent'], 'B', "Rules parameters are correct");

  // Determinism check (10 runs)
  const firstHash = assets[0].knowledgeId;
  for (let i = 0; i < 10; i++) {
    const nextAssets = await engine.synthesize(mockDataset);
    assertEqual(nextAssets[0].knowledgeId, firstHash, `[Deterministic Iter ${i}] Same Knowledge ID`);
  }

  console.log("=== All KnowledgeEngine tests passed! ===");
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
