/**
 * AIOS Employee Learning Foundation
 * Abstraction Interfaces for Knowledge Extraction, Approval, and Learning Registry
 */

import { ResultRecord } from '../../result/models/EmployeeResultModels';
import {
  CandidateStatus,
  KnowledgeCandidate,
  LearningAuditEntry,
  LearningFilter,
  LearningRecord,
} from '../models/EmployeeLearningModels';

export interface IKnowledgeCandidateEngine {
  extractCandidate(result: ResultRecord, pattern: string, confidence: number): LearningRecord;
}

export interface ILearningApprovalEngine {
  approveCandidate(
    learning: LearningRecord,
    authorizedByManager: boolean
  ): CandidateStatus;
  rejectCandidate(learning: LearningRecord): CandidateStatus;
  validateUsageAllowed(learning: LearningRecord): { allowed: boolean; reason?: string };
}

export interface ILearningRegistry {
  registerRecord(record: LearningRecord): LearningRecord;
  getRecord(learningId: string): LearningRecord;
  listRecords(filter?: LearningFilter): LearningRecord[];
  updateRecordStatus(
    learningId: string,
    newStatus: CandidateStatus,
    authorizedByApprovalEngine: boolean
  ): LearningRecord;
  getAuditLogs(learningId?: string): LearningAuditEntry[];
}
