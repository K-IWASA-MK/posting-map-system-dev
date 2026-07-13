import { ValidationArtifact } from './ValidationArtifact';
import { ValidationStageResult } from './ValidationStageResult';

export interface ValidationStageMetrics {
  readonly durationMs: number;
  readonly evaluatedFilesCount?: number;
  readonly cacheHits?: number;
}

export interface ValidationStageOutput {
  readonly result: ValidationStageResult;
  readonly artifact: ValidationArtifact; // Immutable output artifact
  readonly metrics: ValidationStageMetrics;
}
