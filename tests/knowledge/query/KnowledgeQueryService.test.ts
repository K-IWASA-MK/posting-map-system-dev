import { KnowledgeQueryService } from '../../../src/knowledge/query/KnowledgeQueryService';
import { InMemoryKnowledgeRepository } from '../../../src/knowledge/repository/InMemoryKnowledgeRepository';
import { KnowledgeAsset, KnowledgeStatus } from '../../../src/knowledge/contracts';

async function runTests() {
  function assertEqual(actual: any, expected: any, message: string) {
    if (actual !== expected) {
      throw new Error(`[FAIL] ${message}\nExpected: ${expected}\nActual: ${actual}`);
    }
    console.log(`[PASS] ${message}`);
  }

  console.log("=== Running KnowledgeQueryService Tests ===");

  const repo = new InMemoryKnowledgeRepository();
  const service = new KnowledgeQueryService(repo);

  const assetA1: KnowledgeAsset = Object.freeze({
    schemaVersion: '1.0.0',
    knowledgeId: 'KNW-A',
    version: 1,
    status: KnowledgeStatus.APPROVED,
    semantic: Object.freeze({
      nodes: Object.freeze([
        { nodeId: 'N1', label: 'Node 1', type: 'STATE', properties: {} },
        { nodeId: 'N2', label: 'Node 2', type: 'STATE', properties: {} }
      ]),
      edges: Object.freeze([{ edgeId: 'E1', sourceNodeId: 'N1', targetNodeId: 'N2', type: 'TRANSITION', properties: {} }])
    }),
    logicalRules: Object.freeze([{ ruleId: 'R1', ruleType: 'TRANSITION_GUARD', pluginId: 'p1', parameters: Object.freeze({}) }]),
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

  // Save in chaotic order to repository
  await repo.save(assetA2);
  await repo.save(assetB1);
  await repo.save(assetA1);

  // 1. query() basic with Canonical Sort verification
  const res1 = await service.query({
    queryId: 'Q1',
    schemaVersion: '1.0.0'
  });

  assertEqual(res1.assets.length, 3, "Returns 3 assets");
  assertEqual(res1.assets[0].knowledgeId, 'KNW-A', "Canonical Sort: first is KNW-A");
  assertEqual(res1.assets[0].version, 1, "Canonical Sort: first is version 1");
  assertEqual(res1.assets[1].knowledgeId, 'KNW-A', "Canonical Sort: second is KNW-A");
  assertEqual(res1.assets[1].version, 2, "Canonical Sort: second is version 2");
  assertEqual(res1.assets[2].knowledgeId, 'KNW-B', "Canonical Sort: third is KNW-B");
  assertEqual(res1.assets[2].version, 1, "Canonical Sort: third is version 1");

  // 2. Deterministic resultId check
  const firstResultId = res1.resultId;
  const res2 = await service.query({
    queryId: 'Q1',
    schemaVersion: '1.0.0'
  });
  assertEqual(res2.resultId, firstResultId, "resultId is identical for identical query parameters");

  // 3. Node Filter
  const resNode = await service.query({
    queryId: 'Q2',
    schemaVersion: '1.0.0',
    nodeId: 'N1'
  });
  assertEqual(resNode.assets.length, 2, "Finds 2 assets for nodeId N1");

  // 4. Pattern Filter
  const resPat = await service.query({
    queryId: 'Q3',
    schemaVersion: '1.0.0',
    patternId: 'PAT-002'
  });
  assertEqual(resPat.assets.length, 1, "Finds 1 asset for PAT-002");
  assertEqual(resPat.assets[0].knowledgeId, 'KNW-B', "Finds KNW-B");

  // 5. Pagination offset / limit / nextOffset
  const paginatedRes = await service.query({
    queryId: 'QPAG',
    schemaVersion: '1.0.0',
    limit: 2,
    offset: 0
  });
  assertEqual(paginatedRes.assets.length, 2, "Returns 2 assets on page 1");
  assertEqual(paginatedRes.hasNextPage, true, "Has next page");
  assertEqual(paginatedRes.nextOffset, 2, "nextOffset is 2");

  const page2Res = await service.query({
    queryId: 'QPAG2',
    schemaVersion: '1.0.0',
    limit: 2,
    offset: 2
  });
  assertEqual(page2Res.assets.length, 1, "Returns remaining 1 asset on page 2");
  assertEqual(page2Res.hasNextPage, false, "Does not have next page");
  assertEqual(page2Res.nextOffset, undefined, "nextOffset is undefined");

  // 6. Future Extensibility Placeholders: findByEdgeType and findByRuleType
  const matchEdge = await service.findByEdgeType('TRANSITION');
  assertEqual(matchEdge.length, 2, "Finds 2 assets with TRANSITION edges (KNW-A v1, v2)");

  const matchRule = await service.findByRuleType('TRANSITION_GUARD');
  assertEqual(matchRule.length, 2, "Finds 2 assets with TRANSITION_GUARD rules (KNW-A v1, v2)");

  console.log("=== All KnowledgeQueryService tests passed! ===");
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
