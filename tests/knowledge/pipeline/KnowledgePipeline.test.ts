import { KnowledgePipeline } from '../../knowledge/pipeline/KnowledgePipeline';
import { IKnowledgeSourceResolver } from '../../knowledge/source/IKnowledgeSourceResolver';
import { IKnowledgeEngine } from '../../knowledge/engine/IKnowledgeEngine';
import { IKnowledgeGovernanceOrchestrator } from '../../knowledge/governance/IKnowledgeGovernanceOrchestrator';
import { KnowledgeRequest, KnowledgeDataset, KnowledgeStatus } from '../../knowledge/contracts';
import { PipelineStatus } from '../../knowledge/pipeline/PipelineStatus';

async function runTests() {
  function assertEqual(actual: any, expected: any, message: string) {
    if (actual !== expected) {
      throw new Error(`[FAIL] ${message}\nExpected: ${expected}\nActual: ${actual}`);
    }
    console.log(`[PASS] ${message}`);
  }

  console.log("=== Running KnowledgePipeline Tests ===");

  const mockRequest: KnowledgeRequest = {
    requestId: 'REQ-123',
    schemaVersion: '1.0.0',
    filters: { patternTypes: ['SEQUENCE'] }
  };

  const mockDataset: KnowledgeDataset = {
    metadata: {
      datasetId: 'KDS-TEST-123',
      recordCount: 1,
      sourceCount: 1,
      generatedAt: '2026-07-13T00:00:00Z',
      schemaVersion: '1.0.0',
      patternTypes: ['SEQUENCE']
    },
    patterns: []
  };

  const mockApprovedAsset = {
    schemaVersion: '1.0.0',
    knowledgeId: 'KNW-SEQ-001',
    version: 1,
    status: KnowledgeStatus.APPROVED,
    semantic: { nodes: [], edges: [] },
    logicalRules: [],
    metadata: {
      sourcePatternIds: [],
      createdAt: '2026-07-13T00:00:00Z',
      generatedBy: 'test',
      schemaVersion: '1.0.0'
    }
  };

  // 1. Success Flow Test
  const mockResolverSuccess: IKnowledgeSourceResolver = {
    resolve: async () => ({
      requestId: 'REQ-123',
      datasetId: 'KDS-TEST-123',
      dataset: mockDataset,
      patternCount: 1,
      durationMs: 10,
      sourceCount: 1,
      resolvedAt: new Date().toISOString()
    })
  };

  const mockEngineSuccess: IKnowledgeEngine = {
    synthesize: async () => [
      {
        schemaVersion: '1.0.0',
        knowledgeId: 'KNW-DRAFT-123',
        version: 0,
        status: KnowledgeStatus.DRAFT,
        semantic: { nodes: [], edges: [] },
        logicalRules: [],
        metadata: { sourcePatternIds: [], createdAt: '', generatedBy: '', schemaVersion: '' }
      }
    ]
  };

  const mockGovernanceSuccess: IKnowledgeGovernanceOrchestrator = {
    evaluateAndStore: async (drafts) => {
      assertEqual(drafts[0].knowledgeId, 'KNW-DRAFT-123', "Governance orchestrator received correct draft assets");
      return {
        approvedAssets: [mockApprovedAsset],
        rejectedAssets: [],
        decisions: [],
        approvedCount: 1,
        rejectedCount: 0,
        durationMs: 5
      };
    }
  };

  const pipelineSuccess = new KnowledgePipeline(
    mockResolverSuccess,
    mockEngineSuccess,
    mockGovernanceSuccess
  );

  const resultSuccess = await pipelineSuccess.run(mockRequest);
  assertEqual(resultSuccess.status, PipelineStatus.SUCCESS, "Pipeline returns SUCCESS status");
  assertEqual(resultSuccess.approvedCount, 1, "Approved count matches governance result");
  assertEqual(resultSuccess.rejectedCount, 0, "Rejected count matches governance result");
  assertEqual(resultSuccess.datasetId, 'KDS-TEST-123', "Pipeline contains datasetId from resolved dataset");
  assertEqual(resultSuccess.assets[0].knowledgeId, 'KNW-SEQ-001', "Approved asset is populated");
  assertEqual(resultSuccess.requestId, 'REQ-123', "requestId matches input request");

  // Verify non-null runtime metadata values
  assertEqual(typeof resultSuccess.startedAt, 'string', "Runtime startedAt is set");
  assertEqual(typeof resultSuccess.completedAt, 'string', "Runtime completedAt is set");
  assertEqual(typeof resultSuccess.durationMs, 'number', "Runtime durationMs is a number");

  // 2. Failure Flow (Resolver throws exception)
  const mockResolverError: IKnowledgeSourceResolver = {
    resolve: async () => {
      throw new Error("Simulated resolver failure");
    }
  };

  const pipelineError = new KnowledgePipeline(
    mockResolverError,
    mockEngineSuccess,
    mockGovernanceSuccess
  );

  const resultFailure = await pipelineError.run(mockRequest);
  assertEqual(resultFailure.status, PipelineStatus.FAILED, "Pipeline handles exception and returns FAILED status");
  assertEqual(resultFailure.approvedCount, 0, "Approved count is 0 on failure");
  assertEqual(resultFailure.rejectedCount, 0, "Rejected count is 0 on failure");
  assertEqual(resultFailure.assets.length, 0, "Assets array is empty on failure");

  console.log("=== All KnowledgePipeline tests passed! ===");
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
