/**
 * AIOS Employee Learning Foundation
 * Domain Models for Knowledge Candidate Management and Approval Flows
 */

export type CandidateStatus = 'CREATED' | 'REVIEWING' | 'APPROVED' | 'REJECTED';

export interface KnowledgeCandidate {
  readonly pattern: string;
  readonly evidence: string; // Source ResultId / Checksum reference
  readonly confidence: number; // 0.0 - 1.0
  status: CandidateStatus;
}

export interface LearningRecord {
  readonly learningId: string;
  readonly sourceResultId: string;
  readonly employeeId: string;
  readonly taskId: string;
  readonly candidate: Readonly<KnowledgeCandidate>;
  status: CandidateStatus;
  readonly createdAt: string;
}

export interface LearningFilter {
  sourceResultId?: string;
  employeeId?: string;
  taskId?: string;
  status?: CandidateStatus;
}

export interface LearningAuditEntry {
  readonly learningId: string;
  readonly sourceResultId: string;
  readonly candidatePattern: string;
  readonly action: 'EXTRACT_CANDIDATE' | 'UPDATE_STATUS';
  readonly beforeStatus: CandidateStatus | null;
  readonly afterStatus: CandidateStatus;
  readonly timestamp: string;
}
