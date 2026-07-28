/**
 * WorkflowFactory.ts
 * 
 * Factory creating EmployeeWorkflow definition and WorkflowInstance from a WorkflowBlueprint
 */

import { WorkflowBlueprint } from './types/WorkflowBlueprint';
import { EmployeeWorkflow } from '../types/EmployeeWorkflow';
import { WorkflowId } from '../types/WorkflowId';
import { WorkflowInstance, WorkflowInstanceStatus } from '../types/WorkflowInstance';
import { WorkflowInstanceId } from '../types/WorkflowInstanceId';
import { StageState } from '../stage/types/StageState';

export class WorkflowFactory {
  public static createWorkflowFromBlueprint(blueprint: WorkflowBlueprint): EmployeeWorkflow {
    return {
      workflowId: WorkflowId.of(blueprint.blueprintId),
      workflowName: blueprint.workflowName,
      category: blueprint.category,
      description: blueprint.description,
      stages: blueprint.stages.map((s) => ({ ...s })),
      createdAt: new Date().toISOString()
    };
  }

  public static createInstanceFromBlueprint(
    blueprint: WorkflowBlueprint,
    taskId: string,
    instanceId?: string
  ): WorkflowInstance {
    const wfInstId = instanceId ? WorkflowInstanceId.of(instanceId) : WorkflowInstanceId.generate();
    const sortedStages = blueprint.stages
      .map((s) => ({ ...s }))
      .sort((a, b) => a.order - b.order);

    // Initial stage states
    const stages = sortedStages.map((s, index) => ({
      ...s,
      state: index === 0 ? StageState.READY : StageState.PENDING
    }));

    const firstStage = stages.find((s) => s.order === 1) || stages[0];

    return {
      instanceId: wfInstId,
      taskId,
      workflowId: WorkflowId.of(blueprint.blueprintId),
      workflowName: blueprint.workflowName,
      currentStageId: firstStage ? firstStage.stageId.getValue() : undefined,
      stages,
      status: WorkflowInstanceStatus.RUNNING,
      startedAt: new Date().toISOString()
    };
  }
}
