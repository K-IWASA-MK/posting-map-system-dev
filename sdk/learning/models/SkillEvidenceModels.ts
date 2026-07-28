/**
 * SkillEvidenceModels.ts
 * 
 * AIOS Skill Evidence Domain Models
 * Immutable SkillEvidence model representing verified capabilities extracted from KnowledgeCandidates.
 */

import { CapabilityType } from '../../dispatcher';
import { ConfidenceFactor } from '../../knowledge';

export interface SkillEvidence {
  readonly skillEvidenceId: string;
  readonly knowledgeCandidateId: string;
  readonly verifiedCapabilities: ReadonlyArray<CapabilityType>;
  readonly verifiedRoles: ReadonlyArray<string>;
  readonly evidenceStrength: number;
  readonly confidenceFactors: ReadonlyArray<ConfidenceFactor>;
  readonly createdAt: string;
}
