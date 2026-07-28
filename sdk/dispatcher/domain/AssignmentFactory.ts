/**
 * AssignmentFactory.ts
 * 
 * AIOS Task Dispatcher Assignment Factory
 * Deterministic, stateless factory that generates immutable AssignmentContracts.
 */

import { AgentProfile, CapabilityType } from '../models/AgentModels';
import { AssignmentContract, AssignmentReasonCode } from '../models/AssignmentModels';

export class AssignmentFactory {
  /**
   * Deterministically generates a fully frozen AssignmentContract.
   * Stateless, Immutable, Deterministic, Side Effect Free.
   */
  public static createAssignment(
    taskId: string,
    requiredRole: string,
    requiredCapabilities: ReadonlyArray<CapabilityType>,
    selectedAgent: AgentProfile,
    matchScore: number,
    reasonCodes: ReadonlyArray<AssignmentReasonCode>,
    createdAt: string
  ): AssignmentContract {
    const timestamp = createdAt || '2026-07-29T00:00:00.000Z';
    const assignmentId = AssignmentFactory.generateDeterministicAssignmentId(taskId, selectedAgent.agentId, timestamp);

    const contract: AssignmentContract = Object.freeze({
      assignmentId,
      taskId,
      requiredRole,
      requiredCapabilities: Object.freeze([...requiredCapabilities]),
      selectedAgent: Object.freeze({ ...selectedAgent }),
      matchScore,
      reasonCodes: Object.freeze([...reasonCodes]),
      createdAt: timestamp
    });

    return contract;
  }

  private static generateDeterministicAssignmentId(taskId: string, agentId: string, timestamp: string): string {
    let hash = 0;
    const str = `${taskId}:${agentId}:${timestamp}`;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    const positiveHash = Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
    return `ASSIGN-${positiveHash}`;
  }
}
