/**
 * TransitionRules.ts
 * 
 * AIOS Task Lifecycle Transition Rules Matrix
 * Enforces valid state transition paths and outcome state machines.
 */

import { TaskOutcome, TaskState } from '../models/TaskState';

export class TransitionRules {
  private static readonly ALLOWED_STATE_TRANSITIONS: Record<TaskState, ReadonlyArray<TaskState>> = {
    RECEIVED: Object.freeze(['ASSIGNED', 'CLOSED']),
    ASSIGNED: Object.freeze(['READY', 'CLOSED']),
    READY: Object.freeze(['IN_PROGRESS', 'CLOSED']),
    IN_PROGRESS: Object.freeze(['IMPLEMENTATION_DONE', 'CLOSED']),
    IMPLEMENTATION_DONE: Object.freeze(['UNDER_REVIEW', 'CLOSED']),
    UNDER_REVIEW: Object.freeze(['VERIFIED', 'CLOSED']),
    VERIFIED: Object.freeze(['HANDOVER_READY', 'CLOSED']),
    HANDOVER_READY: Object.freeze(['COMPLETED', 'CLOSED']),
    COMPLETED: Object.freeze(['CLOSED']),
    CLOSED: Object.freeze([])
  };

  private static readonly ALLOWED_OUTCOME_TRANSITIONS: Record<TaskOutcome, ReadonlyArray<TaskOutcome>> = {
    PENDING: Object.freeze(['SUCCESS', 'FAILED', 'CANCELLED', 'REJECTED']),
    SUCCESS: Object.freeze([]),
    FAILED: Object.freeze([]),
    CANCELLED: Object.freeze([]),
    REJECTED: Object.freeze([])
  };

  /**
   * Checks if a transition from currentState to nextState is permitted.
   */
  public static isValidStateTransition(current: TaskState, next: TaskState): boolean {
    if (current === next) return true; // Same state no-op transition
    const allowed = TransitionRules.ALLOWED_STATE_TRANSITIONS[current];
    return allowed ? allowed.includes(next) : false;
  }

  /**
   * Checks if an outcome transition from currentOutcome to nextOutcome is permitted.
   */
  public static isValidOutcomeTransition(current: TaskOutcome, next: TaskOutcome): boolean {
    if (current === next) return true; // Same outcome no-op transition
    const allowed = TransitionRules.ALLOWED_OUTCOME_TRANSITIONS[current];
    return allowed ? allowed.includes(next) : false;
  }
}
