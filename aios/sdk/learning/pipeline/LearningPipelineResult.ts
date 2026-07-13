import { LearningPattern } from '../contracts';
import { PipelineStatus } from './PipelineStatus';

export interface LearningPipelineResult {
  readonly requestId: string;
  readonly datasetId: string;
  readonly schemaVersion: string;
  
  readonly status: PipelineStatus;
  readonly startedAt: string; // ISO8601
  readonly completedAt: string; // ISO8601
  readonly durationMs: number;
  
  readonly patternCount: number;
  readonly patterns: ReadonlyArray<LearningPattern>;
}
