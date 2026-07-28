/**
 * WorkflowCoordinator.ts
 * 
 * Unified Coordinator implementing modular interfaces IStageExecutionCoordinator, IAssignmentCoordinator, and ITransitionCoordinator
 */

import { IStageExecutionCoordinator } from './interfaces/IStageExecutionCoordinator';
import { IAssignmentCoordinator } from './interfaces/IAssignmentCoordinator';
import { ITransitionCoordinator } from './interfaces/ITransitionCoordinator';
import { WorkflowInstance } from '../types/WorkflowInstance';
import { WorkflowStage } from '../stage/types/WorkflowStage';
import { CandidateWorker } from '../../supervisor/runtime/WorkerSelectionStrategy';
import { AssignmentResolver } from '../assignment/AssignmentResolver';
import { StageTransitionResolver } from './StageTransitionResolver';
import { WorkflowRouter } from './WorkflowRouter';

export class WorkflowCoordinator
  implements IStageExecutionCoordinator, IAssignmentCoordinator, ITransitionCoordinator {
  
  public selectWorkerForStage(
    stage: WorkflowStage,
    availableWorkers: CandidateWorker[]
  ): CandidateWorker | undefined {
    return AssignmentResolver.resolveWorkerForStage(stage, availableWorkers);
  }

  public canTransitionToStage(
    instance: WorkflowInstance,
    targetStage: WorkflowStage
  ): boolean {
    return StageTransitionResolver.canStageStart(instance, targetStage);
  }

  public transitionToNextStage(
    instance: WorkflowInstance
  ): WorkflowStage | undefined {
    const next = StageTransitionResolver.getNextReadyStage(instance);
    if (!next) return undefined;
    return WorkflowRouter.startCurrentStage(instance, next.stageId.getValue());
  }

  public executeStage(
    instance: WorkflowInstance,
    stage: WorkflowStage,
    assignedWorker: CandidateWorker
  ): boolean {
    const started = WorkflowRouter.startCurrentStage(instance, stage.stageId.getValue());
    return started !== undefined;
  }
}
