/**
 * SkillCandidateModels.ts
 * 
 * AIOS Skill Candidate Domain Models
 * Immutable SkillCandidate model representing capability growth candidates for AI Employees.
 */

import { CapabilityType } from '../../dispatcher';
import { ProficiencyLevel } from '../domain/ProficiencyMapper';

export type LearningFactor =
  | 'HIGH_CONFIDENCE_INPUT'
  | 'EXACT_CAPABILITY_VERIFIED'
  | 'EXACT_ROLE_VERIFIED'
  | 'POLICY_CHECK_PASSED'
  | 'DETERMINISTIC_MAPPER_APPLIED';

export interface SkillCandidate {
  readonly skillCandidateId: string;
  readonly capability: CapabilityType;
  readonly proficiencyLevel: ProficiencyLevel;
  readonly sourceEvidenceId: string;
  readonly learningScore: number;
  readonly learningFactors: ReadonlyArray<LearningFactor>;
  readonly createdAt: string;
}
