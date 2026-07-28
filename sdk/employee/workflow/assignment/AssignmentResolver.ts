/**
 * AssignmentResolver.ts
 * 
 * Resolver evaluating and matching candidate AI Employees for Workflow Stages
 */

import { WorkflowStage } from '../stage/types/WorkflowStage';
import { CandidateWorker } from '../../supervisor/runtime/WorkerSelectionStrategy';
import { StageAssignment } from './types/StageAssignment';

export class AssignmentResolver {
  public static resolveWorkerForStage(
    stage: WorkflowStage,
    candidates: CandidateWorker[]
  ): CandidateWorker | undefined {
    // 1. Filter candidates by matching Profession Category (if assigned)
    const matchingCategory = candidates.filter((c) => {
      const profCategory = c.profile.professionAssignment?.profession.category;
      return profCategory === stage.requiredProfessionCategory;
    });

    if (matchingCategory.length === 0) {
      // Fallback to all candidates if no category match
      return candidates.length > 0 ? candidates[0] : undefined;
    }

    // 2. Filter by requiredMissionId if present
    if (stage.requiredMissionId) {
      const matchingMission = matchingCategory.filter((c) => {
        const missions = c.profile.professionAssignment?.missions || [];
        return missions.some((m) => m.missionId.getValue() === stage.requiredMissionId);
      });
      if (matchingMission.length > 0) {
        return matchingMission[0];
      }
    }

    // Return first category match
    return matchingCategory[0];
  }

  public static createStageAssignment(
    stage: WorkflowStage,
    worker?: CandidateWorker
  ): StageAssignment {
    return {
      stageId: stage.stageId.getValue(),
      stageName: stage.stageName,
      requiredProfessionCategory: stage.requiredProfessionCategory,
      requiredMissionId: stage.requiredMissionId,
      assignedWorker: worker,
      assignedAt: worker ? new Date().toISOString() : undefined
    };
  }
}
