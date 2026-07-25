/**
 * AIOS Employee Result Foundation
 * Domain Models for Immutable Execution Results and Artifact Registry
 */

import { ExecutionResult } from '../../execution/models/ExecutionRuntimeModels';

export type ResultVerificationStatus =
  | 'CREATED'
  | 'RECEIVED'
  | 'VERIFYING'
  | 'VERIFIED'
  | 'REJECTED';

export interface ArtifactRecord {
  readonly artifactId: string;
  readonly artifactType: string;
  readonly location: string;
  readonly checksum: string;
  readonly createdAt: string;
}

export interface ResultRecord {
  readonly resultId: string;
  readonly executionId: string;
  readonly taskId: string;
  readonly employeeId: string;
  readonly executionResult: Readonly<ExecutionResult>;
  readonly artifacts: ReadonlyArray<ArtifactRecord>;
  status: ResultVerificationStatus; // Controlled solely by ResultVerificationEngine
  readonly createdAt: string;
}

export interface ResultFilter {
  executionId?: string;
  taskId?: string;
  employeeId?: string;
  status?: ResultVerificationStatus;
}

export interface ResultAuditEntry {
  readonly resultId: string;
  readonly executionId: string;
  readonly taskId: string;
  readonly employeeId: string;
  readonly action: 'REGISTER' | 'REGISTER_ARTIFACT' | 'UPDATE_STATUS';
  readonly beforeStatus: ResultVerificationStatus | null;
  readonly afterStatus: ResultVerificationStatus;
  readonly timestamp: string;
}
