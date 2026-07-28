/**
 * IStageExecutionCoordinator.ts
 * 
 * Modular Interface for Stage Execution Coordination
 */

import { WorkflowInstance } from '../../types/WorkflowInstance';
import { WorkflowStage } from '../../stage/types/WorkflowStage';
import { CandidateWorker } from '../../../supervisor/runtime/WorkerSelectionStrategy';

export interface IStageExecutionCoordinator {
  executeStage(
    instance: WorkflowInstance,
    stage: WorkflowStage,
    assignedWorker: CandidateWorker
  ): boolean;
}
