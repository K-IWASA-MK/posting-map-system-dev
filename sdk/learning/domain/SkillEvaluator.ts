/**
 * SkillEvaluator.ts
 * 
 * AIOS Skill Evaluator
 * Pure function evaluating KnowledgeCandidate eligibility and issuing frozen SkillEvidence.
 */

import { KnowledgeCandidate } from '../../knowledge';
import { SkillEvidence } from '../models/SkillEvidenceModels';
import { LearningPolicy, LearningPolicyResolver } from './LearningPolicy';

export class SkillEvaluator {
  /**
   * Evaluates a KnowledgeCandidate and produces a SkillEvidence if policy criteria are satisfied.
   * Returns null if policy evaluation fails.
   * Pure function, Stateless, Side-Effect Free.
   */
  public static evaluateCandidate(
    candidate: KnowledgeCandidate,
    policy?: LearningPolicy,
    timestamp?: string
  ): SkillEvidence | null {
    if (!candidate) {
      return null;
    }

    const effectivePolicy = policy || LearningPolicyResolver.getDefaultPolicy();

    if (!effectivePolicy.enabled) {
      return null;
    }

    if (candidate.confidence < effectivePolicy.minimumConfidence) {
      return null;
    }

    if (candidate.extractedCapabilities.length < effectivePolicy.requiredEvidenceCount) {
      return null;
    }

    const effectiveTimestamp = timestamp || candidate.createdAt || '2026-07-29T00:00:00.000Z';
    const skillEvidenceId = SkillEvaluator.generateDeterministicEvidenceId(candidate.candidateId, effectiveTimestamp);

    return Object.freeze({
      skillEvidenceId,
      knowledgeCandidateId: candidate.candidateId,
      verifiedCapabilities: Object.freeze([...candidate.extractedCapabilities]),
      verifiedRoles: Object.freeze([...candidate.extractedRoles]),
      evidenceStrength: candidate.confidence,
      confidenceFactors: Object.freeze([...candidate.confidenceFactors]),
      createdAt: effectiveTimestamp
    });
  }

  private static generateDeterministicEvidenceId(candidateId: string, timestamp: string): string {
    let hash = 0;
    const str = `${candidateId}:${timestamp}`;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    const positiveHash = Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
    return `SE-${positiveHash}`;
  }
}
