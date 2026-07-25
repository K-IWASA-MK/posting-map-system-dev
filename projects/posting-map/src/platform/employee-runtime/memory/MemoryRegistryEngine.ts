/**
 * AIOS Employee Memory Foundation
 * Memory Registry Engine Implementation (Immutability, Versioning & Tamper-proof Hash)
 */

import { MemorySourceValidator } from './MemorySourceValidator';
import { IMemoryRegistry } from './contract/IEmployeeMemory';
import { MemoryRecord, MemorySourceType } from './models/EmployeeMemoryModels';

export class MemoryRegistryEngine implements IMemoryRegistry {
  private memories: Map<string, MemoryRecord> = new Map();
  private validator = new MemorySourceValidator();

  public registerMemory(
    employeeId: string,
    sourceType: MemorySourceType,
    sourceId: string,
    data: any
  ): MemoryRecord {
    // 1. Validate Source Eligibility
    const valRes = this.validator.validateSource(sourceType, data);
    if (!valRes.valid) {
      throw new Error(valRes.reason);
    }

    const timestamp = new Date().toISOString();
    const memoryId = `MEM-${sourceType}-${sourceId}-${Date.now()}`;

    if (this.memories.has(memoryId)) {
      throw new Error(`[Memory Registry Block] MemoryId '${memoryId}' already exists.`);
    }

    const version = 1;
    const rawStr = `${sourceId}:${JSON.stringify(data)}:${version}:${timestamp}`;
    const memoryHash = this.computeHash(rawStr);

    // Freeze record (Immutability & No confidence/score/ranking per Additional Requirement 3)
    const record: MemoryRecord = Object.freeze({
      memoryId: memoryId,
      employeeId: employeeId,
      sourceType: sourceType,
      sourceId: sourceId,
      version: version,
      data: Object.freeze(typeof data === 'object' ? { ...data } : data),
      memoryHash: memoryHash,
      status: 'ACTIVE',
      createdAt: timestamp,
    });

    this.memories.set(memoryId, record);
    return record;
  }

  public createNewVersion(memoryId: string, updatedData: any): MemoryRecord {
    const existing = this.getMemory(memoryId);

    // Validate new data source eligibility
    const valRes = this.validator.validateSource(existing.sourceType, updatedData);
    if (!valRes.valid) {
      throw new Error(valRes.reason);
    }

    const newVersion = existing.version + 1;
    const newMemoryId = `${existing.sourceId}_v${newVersion}`;
    const timestamp = new Date().toISOString();

    const rawStr = `${existing.sourceId}:${JSON.stringify(updatedData)}:${newVersion}:${timestamp}`;
    const memoryHash = this.computeHash(rawStr);

    const newRecord: MemoryRecord = Object.freeze({
      ...existing,
      memoryId: newMemoryId,
      version: newVersion,
      data: Object.freeze(typeof updatedData === 'object' ? { ...updatedData } : updatedData),
      memoryHash: memoryHash,
      createdAt: timestamp,
    });

    this.memories.set(newMemoryId, newRecord);
    return newRecord;
  }

  public getMemory(memoryId: string): MemoryRecord {
    const record = this.memories.get(memoryId);
    if (!record) {
      throw new Error(`[Memory Registry Block] MemoryId '${memoryId}' not found.`);
    }
    return record;
  }

  public listMemories(employeeId?: string): MemoryRecord[] {
    let list = Array.from(this.memories.values());
    if (employeeId) {
      list = list.filter((m) => m.employeeId === employeeId);
    }
    return list;
  }

  private computeHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `HASH-${Math.abs(hash).toString(16)}`;
  }
}
