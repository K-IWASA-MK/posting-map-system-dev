/**
 * WorkflowRouter.ts
 * 
 * Engine advancing Stage states and triggering Workflow Events upon transitions
 */

import { WorkflowInstance, WorkflowInstanceStatus } from '../types/WorkflowInstance';
import { WorkflowStage } from '../stage/types/WorkflowStage';
import { StageState } from '../stage/types/StageState';
import { StageTransitionResolver } from './StageTransitionResolver';
import { WorkflowEventPublisher } from '../event/WorkflowEventPublisher';
import { WorkflowEventType } from '../event/types/WorkflowEventType';
import { WorkflowProgressTracker } from '../progress/WorkflowProgressTracker';

export class WorkflowRouter {
  public static startCurrentStage(instance: WorkflowInstance, stageId?: string): WorkflowStage | undefined {
    const targetId = stageId || instance.currentStageId;
    const stage = instance.stages.find((s) => s.stageId.getValue() === targetId);

    if (!stage) return undefined;

    if (!StageTransitionResolver.canStageStart(instance, stage)) {
      return undefined;
    }

    stage.state = StageState.RUNNING;
    instance.currentStageId = stage.stageId.getValue();

    WorkflowProgressTracker.calculateProgress(instance);
    WorkflowEventPublisher.publish(
      WorkflowEventType.STAGE_STARTED,
      instance.instanceId.getValue(),
      instance.taskId,
      { stageId: stage.stageId.getValue(), stageName: stage.stageName },
      stage.stageId.getValue()
    );

    return stage;
  }

  public static completeStage(
    instance: WorkflowInstance,
    stageId: string,
    producedArtifacts: string[] = []
  ): WorkflowStage | undefined {
    const stage = instance.stages.find((s) => s.stageId.getValue() === stageId);
    if (!stage) return undefined;

    stage.state = StageState.COMPLETED;
    if (producedArtifacts.length > 0) {
      stage.producedArtifacts = [...(stage.producedArtifacts || []), ...producedArtifacts];
    }

    WorkflowProgressTracker.calculateProgress(instance);
    WorkflowEventPublisher.publish(
      WorkflowEventType.STAGE_COMPLETED,
      instance.instanceId.getValue(),
      instance.taskId,
      { stageId: stage.stageId.getValue(), stageName: stage.stageName, producedArtifacts },
      stage.stageId.getValue()
    );

    // Advance to next stage or complete workflow
    const nextStage = StageTransitionResolver.getNextReadyStage(instance);
    if (nextStage) {
      nextStage.state = StageState.READY;
      instance.currentStageId = nextStage.stageId.getValue();
    } else {
      const allDone = instance.stages.every((s) => s.state === StageState.COMPLETED || s.state === StageState.SKIPPED);
      if (allDone) {
        instance.status = WorkflowInstanceStatus.COMPLETED;
        instance.completedAt = new Date().toISOString();
        WorkflowEventPublisher.publish(
          WorkflowEventType.WORKFLOW_COMPLETED,
          instance.instanceId.getValue(),
          instance.taskId,
          { completedAt: instance.completedAt }
        );
      }
    }

    return nextStage;
  }
}
