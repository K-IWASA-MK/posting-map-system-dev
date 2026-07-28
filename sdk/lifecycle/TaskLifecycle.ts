/**
 * TaskLifecycle.ts
 * 
 * AIOS Task Lifecycle Foundation
 * 
 * Single official entry point for managing Task lifecycle state machines and outcomes.
 * 
 * Foundation Rules:
 * - Stateless: Class contains no instance or mutable module state.
 * - Immutable: All returned LifecycleRecord objects are completely frozen.
 * - Deterministic: Pure function execution with no unseeded random or internal clock side-effects.
 * - Side Effect Free: No database, queue, event bus, or runtime invocation side effects.
 */

import { AssignmentContract } from '../dispatcher';
import { LifecycleFactory } from './domain/LifecycleFactory';
import { LifecycleValidator } from './domain/LifecycleValidator';
import { LifecycleRecord, TransitionReasonCode } from './models/LifecycleModels';
import { TaskOutcome, TaskState } from './models/TaskState';

export class TaskLifecycle {
  /**
   * Generates the initial frozen LifecycleRecord for an AssignmentContract.
   * Pure function, Stateless, Deterministic, Side Effect Free.
   */
  public static createInitialLifecycle(
    assignment: AssignmentContract,
    timestamp?: string
  ): LifecycleRecord {
    if (!assignment || !assignment.taskId || !assignment.assignmentId) {
      throw new Error('[TaskLifecycle] Request rejected: AssignmentContract must be a valid assignment object.');
    }

    const effectiveTimestamp = timestamp || assignment.createdAt || '2026-07-29T00:00:00.000Z';
    return LifecycleFactory.createInitialRecord(assignment.taskId, assignment.assignmentId, effectiveTimestamp);
  }

  /**
   * Deterministically transitions a LifecycleRecord to a next state and outcome.
   * Pure function, Stateless, Deterministic, Side Effect Free.
   */
  public static transition(
    current: LifecycleRecord,
    nextState: TaskState,
    nextOutcome: TaskOutcome = 'PENDING',
    reasonCode: TransitionReasonCode = 'STAGE_COMPLETED',
    timestamp?: string
  ): LifecycleRecord {
    const valResult = LifecycleValidator.validateTransition(current, nextState, nextOutcome);
    if (!valResult.valid) {
      throw new Error(`[TaskLifecycle] Transition rejected: ${valResult.reason}`);
    }

    const effectiveTimestamp = timestamp || '2026-07-29T00:00:00.000Z';
    return LifecycleFactory.createTransitionRecord(current, nextState, nextOutcome, reasonCode, effectiveTimestamp);
  }
}
