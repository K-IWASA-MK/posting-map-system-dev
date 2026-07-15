import { IKnowledgePipeline } from './IKnowledgePipeline';
import { IKnowledgeSourceResolver } from '../source/IKnowledgeSourceResolver';
import { IKnowledgeEngine } from '../engine/IKnowledgeEngine';
import { IKnowledgeGovernanceOrchestrator } from '../governance/IKnowledgeGovernanceOrchestrator';
import { KnowledgeRequest } from '../contracts';
import { KnowledgePipelineResult } from './KnowledgePipelineResult';
import { PipelineStatus } from './PipelineStatus';

export class KnowledgePipeline implements IKnowledgePipeline {
  constructor(
    private readonly resolver: IKnowledgeSourceResolver,
    private readonly engine: IKnowledgeEngine,
    private readonly orchestrator: IKnowledgeGovernanceOrchestrator
  ) {}

  public async run(request: KnowledgeRequest): Promise<KnowledgePipelineResult> {
    // Runtime properties (Not part of Knowledge Asset metadata)
    const startTime = Date.now();
    const startedAt = new Date().toISOString();

    try {
      // 1. Resolve source to dataset
      const discoveryResult = await this.resolver.resolve(request);
      
      // Assertion for contract validation
      if (!discoveryResult.dataset) {
        throw new Error("Contract violation: resolved dataset is undefined");
      }

      // 2. Synthesize draft assets (version 0, status DRAFT)
      const draftAssets = await this.engine.synthesize(discoveryResult.dataset);

      // 3. Evaluate, promote and Store via Governance
      const governanceResult = await this.orchestrator.evaluateAndStore(draftAssets);

      return Object.freeze({
        requestId: request.requestId,
        datasetId: discoveryResult.dataset.metadata.datasetId,
        schemaVersion: '1.0.0',
        status: PipelineStatus.SUCCESS,
        startedAt,
        completedAt: new Date().toISOString(),
        durationMs: Date.now() - startTime,
        approvedCount: governanceResult.approvedCount,
        rejectedCount: governanceResult.rejectedCount,
        assets: Object.freeze(governanceResult.approvedAssets)
      });

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown Error";
      console.error(`[KnowledgePipeline] Run failed: ${message}`);

      return Object.freeze({
        requestId: request.requestId,
        datasetId: 'UNKNOWN',
        schemaVersion: '1.0.0',
        status: PipelineStatus.FAILED,
        startedAt,
        completedAt: new Date().toISOString(),
        durationMs: Date.now() - startTime,
        approvedCount: 0,
        rejectedCount: 0,
        assets: Object.freeze([])
      });
    }
  }
}
