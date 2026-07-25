/**
 * AIOS Employee Memory Foundation
 * Integrated Memory Runtime Engine Implementation
 */

import { MemoryAccessGuard } from './MemoryAccessGuard';
import { MemoryRegistryEngine } from './MemoryRegistryEngine';
import { IEmployeeMemoryRuntimeEngine } from './contract/IEmployeeMemory';
import {
  MemoryAccessPurpose,
  MemoryAuditRecord,
  MemoryRecord,
  MemorySourceType,
} from './models/EmployeeMemoryModels';

export class EmployeeMemoryRuntimeEngine implements IEmployeeMemoryRuntimeEngine {
  private registry = new MemoryRegistryEngine();
  private guard = new MemoryAccessGuard();
  private auditLogs: MemoryAuditRecord[] = [];

  public registerFact(
    employeeId: string,
    sourceType: MemorySourceType,
    sourceId: string,
    data: any
  ): MemoryRecord {
    const record = this.registry.registerFact ? 
      this.registry.registerMemory(employeeId, sourceType, sourceId, data) : 
      this.registry.registerMemory(employeeId, sourceType, sourceId, data);

    this.recordAudit(
      record.memoryId,
      sourceId,
      employeeId,
      `REQ-REG-${Date.now()}`,
      'EmployeeMemoryRuntimeEngine',
      'EXECUTION_REFERENCE'
    );

    return record;
  }

  public queryMemory(
    memoryId: string,
    requestingRuntime: string,
    accessPurpose: MemoryAccessPurpose
  ): MemoryRecord {
    // Validate Access
    const accessRes = this.guard.validateAccess(memoryId, requestingRuntime, accessPurpose);
    if (!accessRes.allowed) {
      throw new Error(accessRes.reason);
    }

    const record = this.registry.getMemory(memoryId);

    this.recordAudit(
      memoryId,
      record.sourceId,
      record.employeeId,
      `REQ-QRY-${Date.now()}`,
      requestingRuntime,
      accessPurpose
    );

    return record;
  }

  public findByEmployee(employeeId: string): MemoryRecord[] {
    return this.registry.listMemories(employeeId);
  }

  public getAuditLogs(memoryId?: string): MemoryAuditRecord[] {
    if (memoryId) {
      return this.auditLogs.filter((log) => log.memoryId === memoryId);
    }
    return [...this.auditLogs];
  }

  private recordAudit(
    memoryId: string,
    sourceId: string,
    employeeId: string,
    accessRequestId: string,
    runtime: string,
    accessPurpose: MemoryAccessPurpose
  ) {
    this.auditLogs.push(
      Object.freeze({
        auditId: `AUD-MEM-${Date.now()}`,
        memoryId: memoryId,
        sourceId: sourceId,
        employeeId: employeeId,
        accessRequestId: accessRequestId,
        runtime: runtime,
        accessPurpose: accessPurpose,
        timestamp: new Date().toISOString(),
      })
    );
  }
}
