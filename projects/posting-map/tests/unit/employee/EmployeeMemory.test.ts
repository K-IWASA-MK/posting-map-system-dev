/**
 * AIOS Employee Memory Foundation
 * Unit Test Suite
 */

import { describe, expect, it } from 'vitest';
import { EmployeeMemoryRuntimeEngine } from '../../../src/platform/employee-runtime/memory/EmployeeMemoryRuntimeEngine';
import { MemorySourceValidator } from '../../../src/platform/employee-runtime/memory/MemorySourceValidator';

describe('AIOS Employee Memory Foundation', () => {
  const verifiedExecutionData = {
    taskId: 'TASK-MIE03-01',
    executionId: 'EXEC-001',
    status: 'VERIFIED',
    recordCount: 858,
    durationMs: 3200,
  };

  const failedExecutionData = {
    taskId: 'TASK-MIE03-01',
    executionId: 'EXEC-FAIL-001',
    status: 'FAILED',
    error: 'Execution timeout',
  };

  // Scenario 1: Normal Memory Generation with Fact Integrity Hash
  it('should generate Memory record for VERIFIED Result with fact integrity hash', () => {
    const engine = new EmployeeMemoryRuntimeEngine();
    const memory = engine.registerFact(
      'EMP-MIE03-01',
      'EXECUTION_RESULT',
      'EXEC-001',
      verifiedExecutionData
    );

    expect(memory.status).toBe('ACTIVE');
    expect(memory.version).toBe(1);
    expect(memory.memoryHash).toContain('HASH-');
    expect((memory as any).confidence).toBeUndefined(); // Additional Requirement 3: No confidence/score
  });

  // Scenario 2: Rejection of Memory Generation from FAILED or Unverified Source
  it('should reject Memory generation from FAILED or unverified Result', () => {
    const validator = new MemorySourceValidator();
    const res = validator.validateSource('EXECUTION_RESULT', failedExecutionData);

    expect(res.valid).toBe(false);
    expect(res.reason).toContain("EXECUTION_RESULT Memory requires status 'VERIFIED'");
  });

  // Scenario 3: Memory Record Immutability & Property Mutation Rejection
  it('should reject direct property mutation of MemoryRecord', () => {
    const engine = new EmployeeMemoryRuntimeEngine();
    const memory = engine.registerFact('EMP-MIE03-01', 'EXECUTION_RESULT', 'EXEC-001', verifiedExecutionData);

    // Property mutation attempt must throw
    expect(() => {
      (memory as any).status = 'ARCHIVED';
    }).toThrow();
  });

  // Scenario 4: Memory Access Guard & Authorized Query
  it('should allow authorized runtime query with explicit accessPurpose and block unauthorized access', () => {
    const engine = new EmployeeMemoryRuntimeEngine();
    const memory = engine.registerFact('EMP-MIE03-01', 'EXECUTION_RESULT', 'EXEC-001', verifiedExecutionData);

    // 1. Authorized Runtime Access -> SUCCESS
    const queried = engine.queryMemory(memory.memoryId, 'ExecutionRuntime', 'EXECUTION_REFERENCE');
    expect(queried.memoryId).toBe(memory.memoryId);

    // 2. Unauthorized Runtime Access -> MUST FAIL
    expect(() =>
      engine.queryMemory(memory.memoryId, 'UnauthorizedCustomPlugin', 'EXECUTION_REFERENCE')
    ).toThrow(/Runtime 'UnauthorizedCustomPlugin' is NOT authorized to access Memory/);
  });

  // Scenario 5: Immutable Memory Audit Trail Logging
  it('should record audit trail for memory registration and queries', () => {
    const engine = new EmployeeMemoryRuntimeEngine();
    const memory = engine.registerFact('EMP-MIE03-01', 'EXECUTION_RESULT', 'EXEC-001', verifiedExecutionData);
    engine.queryMemory(memory.memoryId, 'ExecutionRuntime', 'EXECUTION_REFERENCE');

    const logs = engine.getAuditLogs(memory.memoryId);
    expect(logs.length).toBeGreaterThanOrEqual(2);
    expect(logs[1].accessPurpose).toBe('EXECUTION_REFERENCE');
    expect(logs[1].runtime).toBe('ExecutionRuntime');
  });
});
