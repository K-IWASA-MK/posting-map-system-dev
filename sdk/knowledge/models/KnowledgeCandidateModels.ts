/**
 * KnowledgeCandidateModels.ts
 * 
 * AIOS Knowledge Capture Domain Models
 * Model-agnostic KnowledgeCandidate capturing facts vs inferences and auditable confidence factors.
 */

import { CapabilityType } from '../../dispatcher';

/**
 * CandidateType representing organizational pattern categories.
 * Extensible design: Can be extended in future registries with OPERATIONS_PATTERN, COMMUNICATION_PATTERN, etc.
 */
export type CandidateType =
  | 'WORKFLOW_PATTERN'
  | 'IMPLEMENTATION_PATTERN'
  | 'REVIEW_PATTERN'
  | 'AUDIT_PATTERN'
  | 'BEST_PRACTICE';

export type ConfidenceFactor =
  | 'LIFECYCLE_COMPLETED_SUCCESS'
  | 'EXACT_ROLE_MATCH'
  | 'EXACT_CAPABILITY_VERIFIED'
  | 'STRICT_POLICY_PASSED'
  | 'DETERMINISTIC_FACTORY_CREATED';

export interface KnowledgeCandidate {
  readonly candidateId: string;
  readonly taskId: string;
  readonly lifecycleId: string;
  readonly sourceAssignmentId: string;
  readonly candidateType: CandidateType;
  readonly confidence: number;
  readonly confidenceFactors: ReadonlyArray<ConfidenceFactor>;
  readonly facts: ReadonlyArray<string>;
  readonly inferences: ReadonlyArray<string>;
  readonly extractedCapabilities: ReadonlyArray<CapabilityType>;
  readonly extractedRoles: ReadonlyArray<string>;
  readonly evidenceReferences: ReadonlyArray<string>;
  readonly createdAt: string;
}
