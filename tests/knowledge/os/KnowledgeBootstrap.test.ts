import { KnowledgeBootstrap } from '../../knowledge/os/KnowledgeBootstrap';
import { IKnowledgeSourceResolver } from '../../knowledge/source/IKnowledgeSourceResolver';
import { KnowledgeOSState } from '../../knowledge/os/KnowledgeOSState';
import { KnowledgeDataset, KnowledgeRequest, KnowledgeStatus } from '../../knowledge/contracts';
import { PipelineStatus } from '../../knowledge/pipeline/PipelineStatus';

async function runTests() {
  function assertEqual(actual: any, expected: any, message: string) {
    if (actual !== expected) {
      throw new Error(`[FAIL] ${message}\nExpected: ${expected}\nActual: ${actual}`);
    }
    console.log(`[PASS] ${message}`);
  }

  console.log("=== Running KnowledgeBootstrap E2E Tests ===");

  const mockDataset: KnowledgeDataset = {
    metadata: {
      datasetId: 'KDS-E2E',
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
        status: 1 as any, // APPROVED status in Pattern OS
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

  const mockResolver: IKnowledgeSourceResolver = {
    resolve: async () => ({
      requestId: 'REQ-E2E',
      datasetId: 'KDS-E2E',
      dataset: mockDataset,
      patternCount: 1,
      durationMs: 10,
      sourceCount: 1,
      resolvedAt: new Date().toISOString()
    })
  };

  // 1. Boot System
  const { runtime, components, version } = await KnowledgeBootstrap.boot(mockResolver);

  assertEqual(runtime.state, KnowledgeOSState.READY, "Runtime is in READY state");
  assertEqual(version.coreVersion, '5.10.0', "Core version matches 5.10.0");
  assertEqual(version.sprint, '10', "Sprint matches 10");

  // 2. Health and Diagnostics
  const health = await runtime.health();
  assertEqual(health.status, KnowledgeOSState.READY, "Health status is READY");
  assertEqual(health.knowledgeCount, 0, "No initial knowledge in repo");
  assertEqual(health.pluginCount, 1, "1 plugin loaded");
  assertEqual(health.policyCount, 1, "1 policy loaded in central registry");
  assertEqual(health.ruleCount, 1, "1 rule loaded in central registry");
  assertEqual(health.repositoryType, 'IN_MEMORY', "IN_MEMORY repository type returned");

  const diag = await runtime.diagnostics();
  assertEqual(diag.registryPlugins.includes('aios.knowledge.plugin.sequence'), true, "aios.knowledge.plugin.sequence registered");
  assertEqual(diag.registryPolicies.includes('POLICY-K-SEQ-STANDARD'), true, "POLICY-K-SEQ-STANDARD policy registered");

  // 3. E2E Pipeline Run through Query
  const mockRequest: KnowledgeRequest = {
    requestId: 'REQ-E2E-RUN',
    schemaVersion: '1.0.0',
    filters: { patternTypes: ['SEQUENCE'] }
  };

  // Run pipeline
  const pipelineResult = await components.pipeline.run(mockRequest);
  assertEqual(pipelineResult.status, PipelineStatus.SUCCESS, "E2E Pipeline run successful");
  assertEqual(pipelineResult.approvedCount, 1, "1 asset approved (SequenceGovernancePolicy MinimumNodesCountRule passed)");

  // Query service E2E verification
  const queryRes = await components.queryService.query({
    queryId: 'Q-E2E-FINAL',
    schemaVersion: '1.0.0',
    nodeId: 'N-A'
  });
  assertEqual(queryRes.assets.length, 1, "Resolves approved asset via query service");
  assertEqual(queryRes.assets[0].knowledgeId, 'KNW-SEQ-000001', "Official sequential ID is correctly retrieved");

  console.log("=== All KnowledgeBootstrap E2E tests passed! ===");
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
