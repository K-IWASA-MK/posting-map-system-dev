/**
 * WorkflowProgressTracker.ts
 * 
 * Engine calculating and updating WorkflowProgress for a WorkflowInstance
 */

import { WorkflowInstance, WorkflowInstanceStatus } from '../types/WorkflowInstance';
import { WorkflowProgress } from './types/WorkflowProgress';
import { StageState } from '../stage/types/StageState';

export class WorkflowProgressTracker {
  private static progresses: Map<string, WorkflowProgress> = new Map();

  public static calculateProgress(instance: WorkflowInstance): WorkflowProgress {
    const totalStages = instance.stages.length;
    const completedStages = instance.stages.filter((s) => s.state === StageState.COMPLETED);
    const completedStageIds = completedStages.map((s) => s.stageId.getValue());
    
    const remainingStageIds = instance.stages
      .filter((s) => s.state !== StageState.COMPLETED && s.state !== StageState.SKIPPED)
      .map((s) => s.stageId.getValue());

    const progressPercentage = totalStages === 0 ? 100 : Math.round((completedStages.length / totalStages) * 100);

    const producedArtifacts: string[] = [];
    instance.stages.forEach((s) => {
      if (s.producedArtifacts) {
        producedArtifacts.push(...s.producedArtifacts);
      }
    });

    const progress: WorkflowProgress = {
      workflowInstanceId: instance.instanceId.getValue(),
      taskId: instance.taskId,
      currentStageId: instance.currentStageId,
      completedStageIds,
      remainingStageIds,
      progressPercentage,
      status: instance.status,
      producedArtifacts,
      lastUpdated: new Date().toISOString()
    };

    this.progresses.set(instance.instanceId.getValue(), progress);
    return progress;
  }

  public static getProgress(instanceId: string): WorkflowProgress | undefined {
    return this.progresses.get(instanceId);
  }

  public static clear(): void {
    this.progresses.clear();
  }
}
