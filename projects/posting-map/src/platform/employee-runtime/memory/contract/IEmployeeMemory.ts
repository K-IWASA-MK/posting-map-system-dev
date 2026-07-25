/**
 * AIOS Employee Memory Foundation
 * Abstraction Interfaces for Source Validator, Registry, Access Guard, Query Engine, and Memory Engine
 */

import {
  MemoryAccessPurpose,
  MemoryAuditRecord,
  MemoryRecord,
  MemorySourceType,
} from '../models/EmployeeMemoryModels';

export interface IMemorySourceValidator {
  validateSource(sourceType: MemorySourceType, sourceData: any): { valid: boolean; reason?: string };
}

export interface IMemoryRegistry {
  registerMemory(
    employeeId: string,
    sourceType: MemorySourceType,
    sourceId: string,
    data: any
  ): MemoryRecord;
  createNewVersion(memoryId: string, updatedData: any): MemoryRecord;
  getMemory(memoryId: string): MemoryRecord;
  listMemories(employeeId?: string): MemoryRecord[];
}

export interface IMemoryAccessGuard {
  validateAccess(
    memoryId: string,
    requestingRuntime: string,
    accessPurpose: MemoryAccessPurpose
  ): { allowed: boolean; reason?: string };
}

export interface IEmployeeMemoryRuntimeEngine {
  registerFact(
    employeeId: string,
    sourceType: MemorySourceType,
    sourceId: string,
    data: any
  ): MemoryRecord;
  queryMemory(
    memoryId: string,
    requestingRuntime: string,
    accessPurpose: MemoryAccessPurpose
  ): MemoryRecord;
  findByEmployee(employeeId: string): MemoryRecord[];
  getAuditLogs(memoryId?: string): MemoryAuditRecord[];
}
