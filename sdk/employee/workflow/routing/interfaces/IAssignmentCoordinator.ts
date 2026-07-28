/**
 * IAssignmentCoordinator.ts
 * 
 * Modular Interface for Worker Assignment Coordination per Stage
 */

import { WorkflowStage } from '../../stage/types/WorkflowStage';
import { CandidateWorker } from '../../../supervisor/runtime/WorkerSelectionStrategy';

export interface IAssignmentCoordinator {
  selectWorkerForStage(
    stage: WorkflowStage,
    availableWorkers: CandidateWorker[]
  ): CandidateWorker | undefined;
}
