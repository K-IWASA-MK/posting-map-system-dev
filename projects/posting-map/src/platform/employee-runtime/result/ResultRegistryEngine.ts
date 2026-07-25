/**
 * AIOS Employee Result Foundation
 * Result Registry Engine Implementation
 */

import { IResultRegistry } from './contract/IResultRegistry';
import {
  ResultAuditEntry,
  ResultFilter,
  ResultRecord,
  ResultVerificationStatus,
} from './models/EmployeeResultModels';

export class ResultRegistryEngine implements IResultRegistry {
  private results: Map<string, ResultRecord> = new Map();
  private auditLogs: ResultAuditEntry[] = [];

  public registerResult(record: ResultRecord): ResultRecord {
    // 1. Duplicate ResultId Rejection
    if (this.results.has(record.resultId)) {
      throw new Error(
        `[Result Registry Block] ResultId '${record.resultId}' already exists. Overwrite/Modification rejected.`
      );
    }

    // 2. Freeze Result Record (Immutability)
    const frozenRecord: ResultRecord = {
      ...record,
      executionResult: Object.freeze({ ...record.executionResult }),
      artifacts: Object.freeze(record.artifacts.map((a) => Object.freeze({ ...a }))),
      status: record.status || 'CREATED',
    };

    this.results.set(record.resultId, frozenRecord);

    // 3. Log Audit Event
    this.auditLogs.push(
      Object.freeze({
        resultId: record.resultId,
        executionId: record.executionId,
        taskId: record.taskId,
        employeeId: record.employeeId,
        action: 'REGISTER',
        beforeStatus: null,
        afterStatus: frozenRecord.status,
        timestamp: new Date().toISOString(),
      })
    );

    return frozenRecord;
  }

  public getResult(resultId: string): ResultRecord {
    const record = this.results.get(resultId);
    if (!record) {
      throw new Error(`[Result Registry Block] ResultId '${resultId}' not found.`);
    }
    return record;
  }

  public listResults(filter?: ResultFilter): ResultRecord[] {
    let list = Array.from(this.results.values());
    if (!filter) return list;

    if (filter.executionId) list = list.filter((r) => r.executionId === filter.executionId);
    if (filter.taskId) list = list.filter((r) => r.taskId === filter.taskId);
    if (filter.employeeId) list = list.filter((r) => r.employeeId === filter.employeeId);
    if (filter.status) list = list.filter((r) => r.status === filter.status);

    return list;
  }

  public updateResultStatus(
    resultId: string,
    newStatus: ResultVerificationStatus,
    authorizedByVerificationEngine: boolean
  ): ResultRecord {
    const record = this.getResult(resultId);
    const beforeStatus = record.status;

    // 1. Terminal State Check (Immutability)
    if (beforeStatus === 'VERIFIED' || beforeStatus === 'REJECTED') {
      throw new Error(
        `[Result Registry Block] Cannot update status of Result '${resultId}' in terminal status '${beforeStatus}'.`
      );
    }

    // 2. Authorization Check (Only ResultVerificationEngine can authorize VERIFIED)
    if (newStatus === 'VERIFIED' && !authorizedByVerificationEngine) {
      throw new Error(
        `[Result Registry Block] Direct transition to 'VERIFIED' for Result '${resultId}' is forbidden without ResultVerificationEngine authorization.`
      );
    }

    record.status = newStatus;

    this.auditLogs.push(
      Object.freeze({
        resultId: resultId,
        executionId: record.executionId,
        taskId: record.taskId,
        employeeId: record.employeeId,
        action: 'UPDATE_STATUS',
        beforeStatus: beforeStatus,
        afterStatus: newStatus,
        timestamp: new Date().toISOString(),
      })
    );

    return record;
  }

  public getAuditLogs(resultId?: string): ResultAuditEntry[] {
    if (resultId) {
      return this.auditLogs.filter((log) => log.resultId === resultId);
    }
    return [...this.auditLogs];
  }
}
