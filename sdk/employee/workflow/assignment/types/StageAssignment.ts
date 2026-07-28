/**
 * StageAssignment.ts
 * 
 * Binding between a Workflow Stage and a Candidate Worker / Profession
 */

import { ProfessionCategory } from '../../../profession/types/ProfessionCategory';
import { CandidateWorker } from '../../../supervisor/runtime/WorkerSelectionStrategy';

export interface StageAssignment {
  stageId: string;
  stageName: string;
  requiredProfessionCategory: ProfessionCategory;
  requiredMissionId?: string;
  assignedWorker?: CandidateWorker;
  assignedAt?: string;
}
