/**
 * TaskDispatcher.ts
 * 
 * AIOS Task Dispatcher Foundation
 * 
 * Single official entry point for deterministically assigning optimal AI Employees (Agents)
 * based on TaskContract Role and Capabilities.
 * 
 * Foundation Rules:
 * - Stateless: Class contains no instance or mutable module state.
 * - Immutable: All returned AssignmentContract objects are completely frozen.
 * - Deterministic: Pure function execution with no unseeded random or internal clock side-effects.
 * - Side Effect Free: No database, queue, or network I/O, no AI invocations.
 */

import { TaskContract } from '../gateway';
import { AgentRegistry } from './domain/AgentRegistry';
import { AssignmentResolver } from './domain/AssignmentResolver';
import { AssignmentContract } from './models/AssignmentModels';

export class TaskDispatcher {
  /**
   * Deterministically dispatches a TaskContract to the optimal Agent.
   * Pure function, Stateless, Deterministic, Side Effect Free.
   */
  public static dispatch(
    contract: TaskContract,
    timestamp?: string,
    registry?: AgentRegistry
  ): AssignmentContract {
    if (!contract || !contract.taskId) {
      throw new Error('[TaskDispatcher] Request rejected: TaskContract must be a valid contract object.');
    }

    const effectiveRegistry = registry || AgentRegistry.createDefaultRegistry();
    const effectiveTimestamp = timestamp || contract.createdAt || '2026-07-29T00:00:00.000Z';

    return AssignmentResolver.resolveAssignment(contract, effectiveRegistry, effectiveTimestamp);
  }
}
