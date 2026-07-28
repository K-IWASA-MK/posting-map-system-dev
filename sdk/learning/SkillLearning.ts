/**
 * SkillLearning.ts
 * 
 * AIOS Skill Learning Foundation
 * 
 * Single official entry point for evaluating KnowledgeCandidates, issuing SkillEvidence,
 * and generating immutable SkillCandidates for AI Employee capability growth.
 * 
 * Foundation Rules:
 * - Stateless: Class contains no instance or mutable module state.
 * - Immutable: All returned SkillEvidence and SkillCandidate objects are completely frozen.
 * - Deterministic: Pure function execution with no unseeded random or internal clock side-effects.
 * - Side Effect Free: No Agent update, Knowledge DB write, LLM Fine-tuning, or network access.
 */

import { KnowledgeCandidate } from '../knowledge';
import { LearningPolicy } from './domain/LearningPolicy';
import { SkillCandidateFactory } from './domain/SkillCandidateFactory';
import { SkillEvaluator } from './domain/SkillEvaluator';
import { SkillCandidate } from './models/SkillCandidateModels';
import { SkillEvidence } from './models/SkillEvidenceModels';

export class SkillLearning {
  /**
   * Evaluates a KnowledgeCandidate and returns an immutable SkillCandidate.
   * Returns null if policy conditions (e.g. minimumConfidence 0.8) are not satisfied.
   * Pure function, Stateless, Deterministic, Side Effect Free.
   */
  public static learn(
    candidate: KnowledgeCandidate,
    policy?: LearningPolicy,
    timestamp?: string
  ): SkillCandidate | null {
    const evidence = SkillLearning.evaluateEvidence(candidate, policy, timestamp);
    if (!evidence) {
      return null;
    }

    return SkillCandidateFactory.createCandidate(evidence, undefined, timestamp);
  }

  /**
   * Evaluates a KnowledgeCandidate and returns an immutable SkillEvidence.
   * Returns null if policy conditions are not satisfied.
   */
  public static evaluateEvidence(
    candidate: KnowledgeCandidate,
    policy?: LearningPolicy,
    timestamp?: string
  ): SkillEvidence | null {
    if (!candidate) {
      throw new Error('[SkillLearning] Request rejected: KnowledgeCandidate object is required.');
    }

    return SkillEvaluator.evaluateCandidate(candidate, policy, timestamp);
  }
}
