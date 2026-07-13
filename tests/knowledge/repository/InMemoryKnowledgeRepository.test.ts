import { InMemoryKnowledgeRepository } from '../../../src/knowledge/repository/InMemoryKnowledgeRepository';
import { KnowledgeAsset, KnowledgeStatus } from '../../../src/knowledge/contracts';

async function runTests() {
  function assertEqual(actual: any, expected: any, message: string) {
    if (actual !== expected) {
      throw new Error(`[FAIL] ${message}\nExpected: ${expected}\nActual: ${actual}`);
    }
    console.log(`[PASS] ${message}`);
  }

  console.log("=== Running InMemoryKnowledgeRepository Tests ===");

  const repo = new InMemoryKnowledgeRepository();

  const assetA1: KnowledgeAsset = Object.freeze({
    schemaVersion: '1.0.0',
    knowledgeId: 'KNW-A',
    version: 1,
    status: KnowledgeStatus.APPROVED,
    semantic: Object.freeze({
      nodes: Object.freeze([{ nodeId: 'N1', label: 'Node 1', type: 'STATE', properties: {} }]),
      edges: Object.freeze([])
    }),
    logicalRules: Object.freeze([]),
    metadata: Object.freeze({
      sourcePatternIds: Object.freeze(['PAT-001']),
      createdAt: '2026-07-13T00:00:00Z',
      generatedBy: 'p-1',
      schemaVersion: '1.0.0'
    }),
    evaluation: Object.freeze({
      confidence: 0.9,
      quality: 0.95,
      trustLevel: 'HIGH',
      ruleResults: Object.freeze([])
    })
  });

  const assetA2: KnowledgeAsset = Object.freeze({
    ...assetA1,
    version: 2
  });

  const assetB1: KnowledgeAsset = Object.freeze({
    schemaVersion: '1.0.0',
    knowledgeId: 'KNW-B',
    version: 1,
    status: KnowledgeStatus.APPROVED,
    semantic: Object.freeze({
      nodes: Object.freeze([{ nodeId: 'N2', label: 'Node 2', type: 'STATE', properties: {} }]),
      edges: Object.freeze([])
    }),
    logicalRules: Object.freeze([]),
    metadata: Object.freeze({
      sourcePatternIds: Object.freeze(['PAT-002']),
      createdAt: '2026-07-13T00:00:00Z',
      generatedBy: 'p-1',
      schemaVersion: '1.0.0'
    }),
    evaluation: Object.freeze({
      confidence: 0.8,
      quality: 0.8,
      trustLevel: 'MEDIUM',
      ruleResults: Object.freeze([])
    })
  });

  // 1. Save & Count
  await repo.save(assetA2); // Save version 2 first
  await repo.save(assetA1); // Save version 1 second
  await repo.save(assetB1);

  const count = await repo.count();
  assertEqual(count, 3, "Count returns total record count");

  // 2. findLatestVersion
  const latestA = await repo.findLatestVersion('KNW-A');
  assertEqual(latestA?.version, 2, "Resolves correct latest version even if saved out of order");

  // 3. Duplicate version reject
  try {
    await repo.save(assetA1);
    throw new Error("[FAIL] Saved duplicate version");
  } catch(e) {
    console.log("[PASS] Rejected duplicate version save");
  }

  // 4. findAll and Canonical Order check (Id ASC -> version ASC)
  const all = await repo.findAll();
  assertEqual(all.length, 3, "Resolves all assets");
  assertEqual(all[0].knowledgeId, 'KNW-A', "Canonical Sort: first is KNW-A");
  assertEqual(all[0].version, 1, "Canonical Sort: first is version 1");
  assertEqual(all[1].knowledgeId, 'KNW-A', "Canonical Sort: second is KNW-A");
  assertEqual(all[1].version, 2, "Canonical Sort: second is version 2");
  assertEqual(all[2].knowledgeId, 'KNW-B', "Canonical Sort: third is KNW-B");
  assertEqual(all[2].version, 1, "Canonical Sort: third is version 1");

  // 5. findByPatternId
  const matchPat = await repo.findByPatternId('PAT-002');
  assertEqual(matchPat.length, 1, "Finds exactly one asset matching PAT-002");
  assertEqual(matchPat[0].knowledgeId, 'KNW-B', "Matched asset is KNW-B");

  // 6. findByNodeId
  const matchNode = await repo.findByNodeId('N1');
  assertEqual(matchNode.length, 2, "Finds two versions of KNW-A containing nodeId N1");

  console.log("=== All InMemoryKnowledgeRepository tests passed! ===");
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
