/**
 * LearningPolicy.ts
 * 
 * AIOS Skill Learning Policy
 * Defines policy criteria for evaluating KnowledgeCandidates and issuing SkillCandidates.
 */

export interface LearningPolicy {
  readonly enabled: boolean;
  readonly minimumConfidence: number;
  readonly requiredEvidenceCount: number;
  readonly allowBestPractice: boolean;
}

export class LearningPolicyResolver {
  private static readonly DEFAULT_POLICY: LearningPolicy = Object.freeze({
    enabled: true,
    minimumConfidence: 0.8,
    requiredEvidenceCount: 1,
    allowBestPractice: true
  });

  /**
   * Deterministically returns the standard default LearningPolicy.
   */
  public static getDefaultPolicy(): LearningPolicy {
    return LearningPolicyResolver.DEFAULT_POLICY;
  }
}
