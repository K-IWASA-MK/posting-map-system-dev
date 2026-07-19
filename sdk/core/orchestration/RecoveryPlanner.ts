import { RecoveryPlan, RecoveryState } from './models/OrchestrationModels';

export class RecoveryPlanner {
  public createRecoveryPlan(targetId: string, failureReason: string): RecoveryPlan {
    return {
      recoveryId: `REC-PLAN-${Date.now()}`,
      targetId,
      failureReason,
      steps: ['STOP_NODE', 'MIGRATE_RESOURCES', 'RESTART_PROCESS'],
      status: RecoveryState.DETECTED,
      createdAt: new Date().toISOString()
    };
  }

  public transitionState(plan: RecoveryPlan, newState: RecoveryState): RecoveryPlan {
    return {
      ...plan,
      status: newState
    };
  }
}
