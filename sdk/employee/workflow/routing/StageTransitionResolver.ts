/**
 * StageTransitionResolver.ts
 * 
 * Engine evaluating whether a WorkflowStage is ready for transition based on prerequisites and completed stages
 */

import { WorkflowInstance } from '../types/WorkflowInstance';
import { WorkflowStage } from '../stage/types/WorkflowStage';
import { StageState } from '../stage/types/StageState';

export class StageTransitionResolver {
  public static canStageStart(
    instance: WorkflowInstance,
    stage: WorkflowStage
  ): boolean {
    if (stage.state === StageState.COMPLETED || stage.state === StageState.RUNNING) {
      return false;
    }

    if (!stage.prerequisiteStageIds || stage.prerequisiteStageIds.length === 0) {
      return true;
    }

    // Check if all prerequisite stages are COMPLETED or SKIPPED
    return stage.prerequisiteStageIds.every((prereqId) => {
      const prereqStage = instance.stages.find((s) => s.stageId.getValue() === prereqId);
      return prereqStage && (prereqStage.state === StageState.COMPLETED || prereqStage.state === StageState.SKIPPED);
    });
  }

  public static getNextReadyStage(instance: WorkflowInstance): WorkflowStage | undefined {
    const sortedStages = [...instance.stages].sort((a, b) => a.order - b.order);
    return sortedStages.find((s) => s.state === StageState.PENDING || s.state === StageState.READY);
  }
}
