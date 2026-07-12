import { ValidationStageResult } from './ValidationStageResult';
import { ValidationStageType } from './ValidationStageType';

export interface ValidationPipelineResult {
  readonly stageResults: readonly ValidationStageResult[];
  readonly totalDurationMs: number;
  readonly executedStages: readonly ValidationStageType[];
  readonly skippedStages: readonly ValidationStageType[];
  readonly failedStages: readonly ValidationStageType[];
  readonly estimatedCost: number;
  readonly actualCost: number; // Often matches estimatedCost, but could vary dynamically
  readonly generatedAt: string;
}
