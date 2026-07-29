/**
 * AssignmentResolver.ts
 * 
 * AIOS Task Dispatcher Assignment Resolver
 * Integrates Role Matching, Capability Scoring, and Agent Priority Weights to deterministically select optimal Agent.
 */

import { TaskContract } from '../../gateway';
import { AgentProfile, CapabilityType } from '../models/AgentModels';
import { AssignmentContract, AssignmentReasonCode } from '../models/AssignmentModels';
import { AgentRegistry } from './AgentRegistry';
import { CapabilityMatcher } from './CapabilityMatcher';
import { RoleResolver } from './RoleResolver';
import { AssignmentFactory } from './AssignmentFactory';

export class AssignmentResolver {
  /**
   * Deterministically resolves the optimal Agent for a given TaskContract and AgentRegistry.
   * Pure function, Stateless, Deterministic, Side Effect Free.
   */
  public static resolveAssignment(
    contract: TaskContract,
    registry: AgentRegistry,
    timestamp: string
  ): AssignmentContract {
    const requiredRole = RoleResolver.resolveRequiredRole(contract);
    const requiredCapabilities = AssignmentResolver.extractRequiredCapabilities(contract);

    const allAgents = registry.getAllAgents();
    if (allAgents.length === 0) {
      throw new Error('[AssignmentResolver] Failed: AgentRegistry contains no registered agents.');
    }

    // 1. Role Filtering
    let candidateAgents = registry.findAgentsByRole(requiredRole);
    let usedRoleFallback = false;

    if (candidateAgents.length === 0) {
      candidateAgents = allAgents;
      usedRoleFallback = true;
    }

    // 2. Scoring Candidates
    interface ScoredCandidate {
      readonly agent: AgentProfile;
      readonly rawMatchScore: number;
      readonly weightedScore: number;
      readonly capabilityReasonCode: AssignmentReasonCode;
    }

    const scoredCandidates: ScoredCandidate[] = candidateAgents.map((agent) => {
      const matchResult = CapabilityMatcher.evaluateMatch(requiredCapabilities, agent);
      const weightedScore = Math.round((matchResult.matchScore * agent.priorityWeight) * 100) / 100;
      return {
        agent,
        rawMatchScore: matchResult.matchScore,
        weightedScore,
        capabilityReasonCode: matchResult.reasonCode
      };
    });

    // 3. Deterministic Sorting (Highest weightedScore first; tie-break by agentId alphabetical)
    scoredCandidates.sort((a, b) => {
      if (b.weightedScore !== a.weightedScore) {
        return b.weightedScore - a.weightedScore;
      }
      return a.agent.agentId.localeCompare(b.agent.agentId);
    });

    const bestCandidate = scoredCandidates[0];

    // 4. Reason Codes Compilation
    const reasonCodes: AssignmentReasonCode[] = [];

    if (!usedRoleFallback) {
      reasonCodes.push('ROLE_MATCH');
    } else {
      reasonCodes.push('DEFAULT_ROLE_FALLBACK');
    }

    reasonCodes.push(bestCandidate.capabilityReasonCode);

    if (bestCandidate.agent.priorityWeight > 1.0) {
      reasonCodes.push('PRIORITY_WEIGHT_BOOST');
    }

    // 5. Generate immutable AssignmentContract
    return AssignmentFactory.createAssignment(
      contract.taskId,
      requiredRole,
      requiredCapabilities,
      bestCandidate.agent,
      bestCandidate.rawMatchScore,
      reasonCodes,
      timestamp
    );
  }

  /**
   * Helper to map string array capabilities into validated CapabilityType array.
   */
  private static extractRequiredCapabilities(contract: TaskContract): ReadonlyArray<CapabilityType> {
    const validCapabilities: CapabilityType[] = [
      'TYPESCRIPT',
      'PYTHON',
      'ARCHITECTURE',
      'TESTING',
      'SECURITY',
      'GIT',
      'DOCUMENTATION',
      'BROWSER_AUTOMATION',
      'FILE_SYSTEM',
      'AUDIT_LOG_READER',
      'STATIC_ANALYSIS'
    ];

    const result: CapabilityType[] = [];

    // Extract from intent
    if (contract.intent === 'IMPLEMENTATION' || contract.intent === 'HOTFIX') {
      result.push('TYPESCRIPT', 'TESTING', 'GIT');
    } else if (contract.intent === 'DESIGN' || contract.intent === 'PLANNING') {
      result.push('ARCHITECTURE', 'DOCUMENTATION');
    } else if (contract.intent === 'REVIEW') {
      result.push('TESTING', 'STATIC_ANALYSIS');
    } else if (contract.intent === 'AUDIT') {
      result.push('SECURITY', 'AUDIT_LOG_READER');
    } else if (contract.intent === 'RESEARCH' || contract.intent === 'QUESTION') {
      result.push('FILE_SYSTEM', 'DOCUMENTATION');
    }

    // Deduplicate
    const unique = Array.from(new Set(result)).filter((cap) => validCapabilities.includes(cap));
    return Object.freeze(unique);
  }
}
