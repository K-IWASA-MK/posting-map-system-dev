/**
 * AIOS Employee Memory Foundation
 * Domain Models for Memory Records, Source Validation, Access Control, and Audit Logs
 */

export type MemoryStatus = 'ACTIVE' | 'ARCHIVED';

export type MemorySourceType =
  | 'EXECUTION_RESULT'
  | 'WORKFLOW_HISTORY'
  | 'LEARNING_HISTORY'
  | 'COMMUNICATION_HISTORY';

export type MemoryAccessPurpose =
  | 'EXECUTION_REFERENCE'
  | 'KNOWLEDGE_CONTEXT'
  | 'OBSERVABILITY_QUERY'
  | 'AUDIT_REVIEW';

export interface MemoryRecord {
  readonly memoryId: string;
  readonly employeeId: string;
  readonly sourceType: MemorySourceType;
  readonly sourceId: string;
  readonly version: number;
  readonly data: any; // Immutable Fact Data
  readonly memoryHash: string; // Additional Requirement 1: Fact integrity hash
  readonly status: MemoryStatus;
  readonly createdAt: string;
}

export interface MemoryAuditRecord {
  readonly auditId: string;
  readonly memoryId: string;
  readonly sourceId: string;
  readonly employeeId: string;
  readonly accessRequestId: string;
  readonly runtime: string;
  readonly accessPurpose: MemoryAccessPurpose; // Additional Requirement 2: Access purpose audit
  readonly timestamp: string;
}
