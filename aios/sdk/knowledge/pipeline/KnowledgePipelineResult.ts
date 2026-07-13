import { KnowledgeAsset } from '../contracts';
import { PipelineStatus } from './PipelineStatus';

export interface KnowledgePipelineResult {
  readonly requestId: string;
  readonly datasetId: string;
  readonly schemaVersion: string;
  readonly status: PipelineStatus;
  
  /**
   * Runtime metadata only.
   * Not persisted as Knowledge Asset.
   */
  readonly startedAt: string;
  readonly completedAt: string;
  readonly durationMs: number;
  
  readonly approvedCount: number;
  readonly rejectedCount: number;
  readonly assets: ReadonlyArray<KnowledgeAsset>;
}
