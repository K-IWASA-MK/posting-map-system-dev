import { LearningRequest } from '../contracts';
import { ILearningSourceResolver } from '../source';
import { ILearningEngine } from './ILearningEngine';
import { ILearningPipeline } from './ILearningPipeline';
import { LearningPipelineResult } from './LearningPipelineResult';
import { PipelineStatus } from './PipelineStatus';

import { IGovernanceOrchestrator } from '../governance';

export class LearningPipeline implements ILearningPipeline {
  constructor(
    private readonly resolver: ILearningSourceResolver,
    private readonly engine: ILearningEngine,
    private readonly orchestrator: IGovernanceOrchestrator
  ) {}

  public async run(request: LearningRequest): Promise<LearningPipelineResult> {
    const startTime = Date.now();
    const startedAt = new Date().toISOString();

    try {
      // 1. Resolve Source to Dataset
      const dataset = await this.resolver.resolve(request);

      // 2. Extract Patterns via Learning Engine (version=0)
      const discoveredPatterns = await this.engine.learn(dataset);

      // 3. Evaluate and Store via Governance Orchestrator (returns version>=1 APPROVED patterns)
      const governanceResult = await this.orchestrator.evaluateAndStore(discoveredPatterns);
      const approvedPatterns = governanceResult.approvedPatterns;

      // 4. Return Pipeline Result
      return Object.freeze({
        requestId: request.requestId,
        datasetId: dataset.datasetId,
        schemaVersion: '1.0.0',
        status: PipelineStatus.SUCCESS,
        startedAt,
        completedAt: new Date().toISOString(),
        durationMs: Date.now() - startTime,
        patternCount: approvedPatterns.length,
        patterns: Object.freeze(approvedPatterns)
      });
    } catch (error: any) {
      // Handle failures gracefully in the pipeline
      return Object.freeze({
        requestId: request.requestId,
        datasetId: 'UNKNOWN',
        schemaVersion: '1.0.0',
        status: PipelineStatus.FAILED,
        startedAt,
        completedAt: new Date().toISOString(),
        durationMs: Date.now() - startTime,
        patternCount: 0,
        patterns: Object.freeze([])
      });
    }
  }
}
