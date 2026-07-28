/**
 * ITransitionCoordinator.ts
 * 
 * Modular Interface for Stage Transition Coordination
 */

import { WorkflowInstance } from '../../types/WorkflowInstance';
import { WorkflowStage } from '../../stage/types/WorkflowStage';

export interface ITransitionCoordinator {
  canTransitionToStage(
    instance: WorkflowInstance,
    targetStage: WorkflowStage
  ): boolean;
  
  transitionToNextStage(
    instance: WorkflowInstance
  ): WorkflowStage | undefined;
}
