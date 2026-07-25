/**
 * AIOS Basic AI Employee Governance Foundation (v1)
 * Deterministic Execution State Machine (FSM)
 */

import { ExecutionState } from '../models/EmployeeDomainModels';

export class EmployeeStateMachine {
  private state: ExecutionState = 'IDLE';

  public getState(): ExecutionState {
    return this.state;
  }

  public transitionTo(nextState: ExecutionState, reason?: string): ExecutionState {
    const validTransitions: Record<ExecutionState, ExecutionState[]> = {
      IDLE: ['ASSIGNED', 'ABORTED'],
      ASSIGNED: ['VALIDATING', 'ABORTED', 'WAITING_APPROVAL'],
      VALIDATING: ['EXECUTING', 'ABORTED', 'WAITING_APPROVAL'],
      EXECUTING: ['VERIFYING', 'ABORTED', 'WAITING_APPROVAL', 'TIMEOUT'],
      VERIFYING: ['COMPLETED', 'ABORTED', 'WAITING_APPROVAL'],
      COMPLETED: [],
      WAITING_APPROVAL: ['ASSIGNED', 'VALIDATING', 'EXECUTING', 'ABORTED'],
      TIMEOUT: ['ABORTED'],
      ABORTED: [],
    };

    const allowedNext = validTransitions[this.state];
    if (!allowedNext || !allowedNext.includes(nextState)) {
      throw new Error(
        `[FSM Block] Invalid state transition from ${this.state} to ${nextState}. Reason: ${reason || 'State transition policy violation'}`
      );
    }

    this.state = nextState;
    return this.state;
  }

  public triggerStopForApproval(reason: string): ExecutionState {
    return this.transitionTo('WAITING_APPROVAL', `STOP Triggered: ${reason}`);
  }
}
