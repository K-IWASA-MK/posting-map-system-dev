/**
 * AIOS Employee Result Foundation
 * Abstraction Interfaces for Result Registry, Artifact Registry, and Result Verification
 */

import {
  ArtifactRecord,
  ResultAuditEntry,
  ResultFilter,
  ResultRecord,
  ResultVerificationStatus,
} from '../models/EmployeeResultModels';

export interface IArtifactRegistry {
  registerArtifact(resultId: string, artifact: ArtifactRecord): ArtifactRecord;
  getArtifacts(resultId: string): ArtifactRecord[];
  verifyArtifactChecksum(artifactId: string, expectedChecksum: string): boolean;
}

export interface IResultVerificationEngine {
  verifyResult(
    result: ResultRecord,
    isPhysicalEvidenceVerified: boolean
  ): ResultVerificationStatus;
}

export interface IResultRegistry {
  registerResult(record: ResultRecord): ResultRecord;
  getResult(resultId: string): ResultRecord;
  listResults(filter?: ResultFilter): ResultRecord[];
  updateResultStatus(
    resultId: string,
    newStatus: ResultVerificationStatus,
    authorizedByVerificationEngine: boolean
  ): ResultRecord;
  getAuditLogs(resultId?: string): ResultAuditEntry[];
}
