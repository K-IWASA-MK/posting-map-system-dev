/**
 * WorkflowStage.ts
 * 
 * Immutable Workflow Stage Specification featuring inputs, expectedOutputs, and producedArtifacts
 */

import { StageId } from './StageId';
import { StageState } from './StageState';
import { ProfessionCategory } from '../../../profession/types/ProfessionCategory';

export interface WorkflowStage {
  stageId: StageId;
  stageName: string;
  order: number;
  requiredProfessionCategory: ProfessionCategory;
  requiredMissionId?: string;
  state: StageState;
  prerequisiteStageIds?: string[];
  inputs?: string[];
  expectedOutputs?: string[];
  producedArtifacts?: string[];
}
