/**
 * CapabilityMatcher.ts
 * 
 * AIOS Task Dispatcher Capability Matcher
 * Pure function evaluating CapabilityType overlap and calculating match scores.
 */

import { AgentProfile, CapabilityType } from '../models/AgentModels';
import { AssignmentReasonCode } from '../models/AssignmentModels';

export interface CapabilityMatchResult {
  readonly matchScore: number;
  readonly matchedCapabilities: ReadonlyArray<CapabilityType>;
  readonly reasonCode: AssignmentReasonCode;
}

export class CapabilityMatcher {
  /**
   * Deterministically evaluates capability match score between requiredCapabilities and agent capabilities.
   * Stateless & Side-Effect Free.
   */
  public static evaluateMatch(
    requiredCapabilities: ReadonlyArray<CapabilityType>,
    agent: AgentProfile
  ): CapabilityMatchResult {
    if (!requiredCapabilities || requiredCapabilities.length === 0) {
      return Object.freeze({
        matchScore: 100.0,
        matchedCapabilities: Object.freeze([]),
        reasonCode: 'EXACT_CAPABILITY_MATCH'
      });
    }

    const matched: CapabilityType[] = [];
    for (const reqCap of requiredCapabilities) {
      if (agent.capabilities.includes(reqCap)) {
        matched.push(reqCap);
      }
    }

    const ratio = matched.length / requiredCapabilities.length;
    const baseScore = Math.round(ratio * 10000) / 100; // Round to 2 decimal places

    const reasonCode: AssignmentReasonCode = matched.length === requiredCapabilities.length
      ? 'EXACT_CAPABILITY_MATCH'
      : 'PARTIAL_CAPABILITY_MATCH';

    return Object.freeze({
      matchScore: baseScore,
      matchedCapabilities: Object.freeze(matched),
      reasonCode
    });
  }
}
