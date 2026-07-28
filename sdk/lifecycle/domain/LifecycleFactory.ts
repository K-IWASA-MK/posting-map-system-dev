/**
 * LifecycleFactory.ts
 * 
 * AIOS Task Lifecycle Factory
 * Deterministic, stateless factory that generates immutable LifecycleRecords.
 */

import { LifecycleRecord, TransitionReasonCode } from '../models/LifecycleModels';
import { TaskOutcome, TaskState } from '../models/TaskState';

export class LifecycleFactory {
  /**
   * Generates a fully frozen initial LifecycleRecord from assignment.
   */
  public static createInitialRecord(
    taskId: string,
    assignmentId: string,
    timestamp: string
  ): LifecycleRecord {
    const lifecycleId = LifecycleFactory.generateDeterministicLifecycleId(taskId, assignmentId, timestamp);

    return Object.freeze({
      lifecycleId,
      taskId,
      assignmentId,
      currentState: 'ASSIGNED',
      previousState: 'RECEIVED',
      outcome: 'PENDING',
      previousOutcome: 'NONE',
      transitionReasonCode: 'AGENT_ASSIGNED',
      transitionedAt: timestamp
    });
  }

  /**
   * Generates a new frozen LifecycleRecord representing a state transition.
   */
  public static createTransitionRecord(
    current: LifecycleRecord,
    nextState: TaskState,
    nextOutcome: TaskOutcome,
    reasonCode: TransitionReasonCode,
    timestamp: string
  ): LifecycleRecord {
    return Object.freeze({
      lifecycleId: current.lifecycleId,
      taskId: current.taskId,
      assignmentId: current.assignmentId,
      currentState: nextState,
      previousState: current.currentState,
      outcome: nextOutcome,
      previousOutcome: current.outcome,
      transitionReasonCode: reasonCode,
      transitionedAt: timestamp
    });
  }

  private static generateDeterministicLifecycleId(taskId: string, assignmentId: string, timestamp: string): string {
    let hash = 0;
    const str = `${taskId}:${assignmentId}:${timestamp}`;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    const positiveHash = Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
    return `LC-${positiveHash}`;
  }
}
