/**
 * SkillCandidateFactory.ts
 * 
 * AIOS Skill Candidate Factory
 * Pure function constructing frozen SkillCandidates from verified SkillEvidence.
 */

import { CapabilityType } from '../../dispatcher';
import { LearningFactor, SkillCandidate } from '../models/SkillCandidateModels';
import { SkillEvidence } from '../models/SkillEvidenceModels';
import { ProficiencyMapper } from './ProficiencyMapper';

export class SkillCandidateFactory {
  /**
   * Deterministically constructs a frozen SkillCandidate from SkillEvidence.
   * Stateless, Immutable, Deterministic, Side Effect Free.
   */
  public static createCandidate(
    evidence: SkillEvidence,
    targetCapability?: CapabilityType,
    timestamp?: string
  ): SkillCandidate {
    if (!evidence) {
      throw new Error('[SkillCandidateFactory] SkillEvidence is required.');
    }

    const effectiveCapability = targetCapability || evidence.verifiedCapabilities[0] || 'TYPESCRIPT';
    const effectiveTimestamp = timestamp || evidence.createdAt || '2026-07-29T00:00:00.000Z';

    const learningScore = Math.min(100.0, Math.max(0.0, evidence.evidenceStrength * 100.0));
    const proficiencyLevel = ProficiencyMapper.mapScoreToLevel(learningScore);

    const skillCandidateId = SkillCandidateFactory.generateDeterministicCandidateId(
      evidence.skillEvidenceId,
      effectiveCapability,
      effectiveTimestamp
    );

    const learningFactors: ReadonlyArray<LearningFactor> = Object.freeze([
      'HIGH_CONFIDENCE_INPUT',
      'EXACT_CAPABILITY_VERIFIED',
      'EXACT_ROLE_VERIFIED',
      'POLICY_CHECK_PASSED',
      'DETERMINISTIC_MAPPER_APPLIED'
    ]);

    return Object.freeze({
      skillCandidateId,
      capability: effectiveCapability,
      proficiencyLevel,
      sourceEvidenceId: evidence.skillEvidenceId,
      learningScore,
      learningFactors,
      createdAt: effectiveTimestamp
    });
  }

  private static generateDeterministicCandidateId(evidenceId: string, capability: string, timestamp: string): string {
    let hash = 0;
    const str = `${evidenceId}:${capability}:${timestamp}`;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    const positiveHash = Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
    return `SKC-${positiveHash}`;
  }
}
