/**
 * AIOS Knowledge Runtime Foundation
 * Domain Models for Approved Knowledge References and Read-Only Contexts
 */

import { CandidateStatus } from '../../learning/models/EmployeeLearningModels';

export interface KnowledgeReference {
  readonly knowledgeId: string;
  readonly sourceLearningId: string;
  readonly pattern: string;
  readonly evidence: string;
  readonly confidence: number;
  readonly version: number;
  readonly approvedAt: string;
  readonly status: 'APPROVED'; // Strictly 'APPROVED' only
}

export interface KnowledgeFilter {
  pattern?: string;
  taskType?: string;
  capability?: string;
  version?: number;
}

export interface KnowledgeContext {
  readonly contextId: string;
  readonly taskId: string;
  readonly references: ReadonlyArray<Readonly<KnowledgeReference>>;
  readonly generatedAt: string;
}

export interface KnowledgeAccessRecord {
  readonly accessId: string;
  readonly knowledgeId: string;
  readonly accessRequestId: string;
  readonly taskId: string;
  readonly employeeId: string;
  readonly resultStatus: 'ALLOWED' | 'BLOCKED';
  readonly timestamp: string;
}
