/**
 * AIOS Employee Learning Foundation
 * Learning Registry Engine Implementation
 */

import { ILearningRegistry } from './contract/ILearningRegistry';
import {
  CandidateStatus,
  LearningAuditEntry,
  LearningFilter,
  LearningRecord,
} from './models/EmployeeLearningModels';

export class LearningRegistryEngine implements ILearningRegistry {
  private records: Map<string, LearningRecord> = new Map();
  private auditLogs: LearningAuditEntry[] = [];

  public registerRecord(record: LearningRecord): LearningRecord {
    // 1. Duplicate LearningId Rejection
    if (this.records.has(record.learningId)) {
      throw new Error(
        `[Learning Registry Block] LearningId '${record.learningId}' already exists. Overwrite/Modification rejected.`
      );
    }

    // 2. Freeze Learning Record (Immutability)
    const frozenRecord: LearningRecord = {
      ...record,
      candidate: Object.freeze({ ...record.candidate }),
      status: record.status || 'CREATED',
    };

    this.records.set(record.learningId, frozenRecord);

    // 3. Log Audit Event
    this.auditLogs.push(
      Object.freeze({
        learningId: record.learningId,
        sourceResultId: record.sourceResultId,
        candidatePattern: record.candidate.pattern,
        action: 'EXTRACT_CANDIDATE',
        beforeStatus: null,
        afterStatus: frozenRecord.status,
        timestamp: new Date().toISOString(),
      })
    );

    return frozenRecord;
  }

  public getRecord(learningId: string): LearningRecord {
    const record = this.records.get(learningId);
    if (!record) {
      throw new Error(`[Learning Registry Block] LearningId '${learningId}' not found.`);
    }
    return record;
  }

  public listRecords(filter?: LearningFilter): LearningRecord[] {
    let list = Array.from(this.records.values());
    if (!filter) return list;

    if (filter.sourceResultId) list = list.filter((r) => r.sourceResultId === filter.sourceResultId);
    if (filter.employeeId) list = list.filter((r) => r.employeeId === filter.employeeId);
    if (filter.taskId) list = list.filter((r) => r.taskId === filter.taskId);
    if (filter.status) list = list.filter((r) => r.status === filter.status);

    return list;
  }

  public updateRecordStatus(
    learningId: string,
    newStatus: CandidateStatus,
    authorizedByApprovalEngine: boolean
  ): LearningRecord {
    const record = this.getRecord(learningId);
    const beforeStatus = record.status;

    // 1. Terminal State Check
    if (beforeStatus === 'APPROVED' || beforeStatus === 'REJECTED') {
      throw new Error(
        `[Learning Registry Block] Cannot update status of Learning record '${learningId}' in terminal status '${beforeStatus}'.`
      );
    }

    // 2. Authorization Check for APPROVED
    if (newStatus === 'APPROVED' && !authorizedByApprovalEngine) {
      throw new Error(
        `[Learning Registry Block] Direct transition to 'APPROVED' for Learning record '${learningId}' is forbidden without Approval Engine authorization.`
      );
    }

    record.status = newStatus;
    (record as any).candidate = Object.freeze({ ...record.candidate, status: newStatus });

    this.auditLogs.push(
      Object.freeze({
        learningId: learningId,
        sourceResultId: record.sourceResultId,
        candidatePattern: record.candidate.pattern,
        action: 'UPDATE_STATUS',
        beforeStatus: beforeStatus,
        afterStatus: newStatus,
        timestamp: new Date().toISOString(),
      })
    );

    return record;
  }

  public getAuditLogs(learningId?: string): LearningAuditEntry[] {
    if (learningId) {
      return this.auditLogs.filter((log) => log.learningId === learningId);
    }
    return [...this.auditLogs];
  }
}
