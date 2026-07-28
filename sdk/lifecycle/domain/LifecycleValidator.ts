/**
 * LifecycleValidator.ts
 * 
 * AIOS Task Lifecycle Transition Validator
 * Pure function validating state and outcome transition compliance.
 */

import { LifecycleRecord } from '../models/LifecycleModels';
import { TaskOutcome, TaskState } from '../models/TaskState';
import { TransitionRules } from './TransitionRules';

export class LifecycleValidator {
  /**
   * Validates state and outcome transitions.
   * Stateless & Side-Effect Free.
   */
  public static validateTransition(
    current: LifecycleRecord,
    nextState: TaskState,
    nextOutcome?: TaskOutcome
  ): { valid: boolean; reason?: string } {
    if (!current) {
      return { valid: false, reason: 'Current LifecycleRecord is required.' };
    }

    // 1. State transition check
    if (!TransitionRules.isValidStateTransition(current.currentState, nextState)) {
      return {
        valid: false,
        reason: `Illegal TaskState transition from [${current.currentState}] to [${nextState}]. Backward moves or skipping pipeline stages are forbidden.`
      };
    }

    // 2. Outcome transition check
    if (nextOutcome && nextOutcome !== current.outcome) {
      if (!TransitionRules.isValidOutcomeTransition(current.outcome, nextOutcome)) {
        return {
          valid: false,
          reason: `Illegal TaskOutcome transition from [${current.outcome}] to [${nextOutcome}]. Terminal outcomes cannot be reverted.`
        };
      }
    }

    return { valid: true };
  }
}
