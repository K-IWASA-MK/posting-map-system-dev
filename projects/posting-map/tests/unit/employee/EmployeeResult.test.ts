/**
 * AIOS Employee Result Foundation
 * Unit Test Suite
 */

import { describe, expect, it } from 'vitest';
import { ArtifactRegistry } from '../../../src/platform/employee-runtime/result/ArtifactRegistry';
import { ResultRegistryEngine } from '../../../src/platform/employee-runtime/result/ResultRegistryEngine';
import { ResultVerificationEngine } from '../../../src/platform/employee-runtime/result/ResultVerificationEngine';
import {
  ArtifactRecord,
  ResultRecord,
} from '../../../src/platform/employee-runtime/result/models/EmployeeResultModels';

describe('AIOS Employee Result Foundation', () => {
  const sampleResult: ResultRecord = {
    resultId: 'RES-MIE03-01',
    executionId: 'EXEC-TASK-MIE03-01',
    taskId: 'TASK-MIE03-01',
    employeeId: 'EMP-MIE03-01',
    executionResult: {
      output: '91 area sheets created for Mie 3rd District',
      status: 'SUCCESS',
      artifact: 'MIE03_Spreadsheet_91Sheets',
      timestamp: '2026-07-26T04:16:00Z',
    },
    artifacts: [],
    status: 'CREATED',
    createdAt: '2026-07-26T04:16:00Z',
  };

  const sampleArtifact: ArtifactRecord = {
    artifactId: 'ART-MIE03-01',
    artifactType: 'SPREADSHEET',
    location: 'https://docs.google.com/spreadsheets/d/1xQUvlCaUO103rjSGmdcFQQFkukodG4Dg9mS_teWT7uA',
    checksum: 'sha256_mie03_spreadsheet_hash_858',
    createdAt: '2026-07-26T04:16:00Z',
  };

  // Scenario 1: Unique Result Registration & Duplicate ResultId Rejection
  it('should register ExecutionResult uniquely and reject duplicate ResultId', () => {
    const registry = new ResultRegistryEngine();
    const registered = registry.registerResult(sampleResult);

    expect(registered.resultId).toBe('RES-MIE03-01');
    expect(registry.getResult('RES-MIE03-01').taskId).toBe('TASK-MIE03-01');

    // Duplicate ResultId attempt (Immutability check)
    expect(() => registry.registerResult(sampleResult)).toThrow(
      /ResultId 'RES-MIE03-01' already exists/
    );
  });

  // Scenario 2: Artifact Registration & Duplicate ArtifactId Rejection
  it('should register Artifact and reject duplicate ArtifactId', () => {
    const artifactRegistry = new ArtifactRegistry();
    artifactRegistry.registerArtifact('RES-MIE03-01', sampleArtifact);

    const list = artifactRegistry.getArtifacts('RES-MIE03-01');
    expect(list.length).toBe(1);
    expect(list[0].checksum).toBe('sha256_mie03_spreadsheet_hash_858');

    // Duplicate ArtifactId attempt
    expect(() => artifactRegistry.registerArtifact('RES-MIE03-01', sampleArtifact)).toThrow(
      /ArtifactId 'ART-MIE03-01' already exists/
    );
  });

  // Scenario 3: Artifact Checksum Verification & Mismatch Detection
  it('should verify artifact checksum and detect checksum mismatch', () => {
    const artifactRegistry = new ArtifactRegistry();
    artifactRegistry.registerArtifact('RES-MIE03-01', sampleArtifact);

    // Correct Checksum
    const isMatched = artifactRegistry.verifyArtifactChecksum(
      'ART-MIE03-01',
      'sha256_mie03_spreadsheet_hash_858'
    );
    expect(isMatched).toBe(true);

    // Mismatched Checksum
    const isMismatch = artifactRegistry.verifyArtifactChecksum(
      'ART-MIE03-01',
      'invalid_checksum_hash'
    );
    expect(isMismatch).toBe(false);
  });

  // Scenario 4: Direct Transition Block to VERIFIED without Verification Engine Authorization
  it('should block direct status transition to VERIFIED without Verification Engine authorization', () => {
    const registry = new ResultRegistryEngine();
    registry.registerResult(sampleResult);

    // Direct transition attempt without authorization
    expect(() =>
      registry.updateResultStatus('RES-MIE03-01', 'VERIFIED', false)
    ).toThrow(/Direct transition to 'VERIFIED' for Result 'RES-MIE03-01' is forbidden/);
  });

  // Scenario 5: Rejection of Invalid Status Transition (REJECTED -> VERIFIED)
  it('should reject invalid status transition from REJECTED to VERIFIED', () => {
    const verificationEngine = new ResultVerificationEngine();
    const rejectedResult: ResultRecord = {
      ...sampleResult,
      resultId: 'RES-REJECTED-01',
      status: 'REJECTED',
    };

    expect(() => verificationEngine.verifyResult(rejectedResult, true)).toThrow(
      /Cannot transition Result 'RES-REJECTED-01' from 'REJECTED' to 'VERIFIED'/
    );
  });

  // Scenario 6: Rejection of Post-VERIFIED Modification
  it('should reject post-VERIFIED status modifications (Result Immutability)', () => {
    const registry = new ResultRegistryEngine();
    const verificationEngine = new ResultVerificationEngine();

    registry.registerResult({ ...sampleResult, resultId: 'RES-VERIFIED-01' });

    // Verify result via ResultVerificationEngine
    const verStatus = verificationEngine.verifyResult(
      registry.getResult('RES-VERIFIED-01'),
      true
    );
    expect(verStatus).toBe('VERIFIED');

    // Apply VERIFIED status via Authorized Engine call
    registry.updateResultStatus('RES-VERIFIED-01', 'VERIFIED', true);
    expect(registry.getResult('RES-VERIFIED-01').status).toBe('VERIFIED');

    // Attempt modification after VERIFIED (Must fail)
    expect(() =>
      registry.updateResultStatus('RES-VERIFIED-01', 'REJECTED', true)
    ).toThrow(/Cannot update status of Result 'RES-VERIFIED-01' in terminal status 'VERIFIED'/);
  });

  // Scenario 7: Normal Result Pipeline (Execution -> Result -> Artifact -> Verification -> VERIFIED)
  it('should complete full Result pipeline through verification to VERIFIED status', () => {
    const registry = new ResultRegistryEngine();
    const artifactRegistry = new ArtifactRegistry();
    const verificationEngine = new ResultVerificationEngine();

    // 1. Execution Result Registered
    const resultRecord = registry.registerResult({
      ...sampleResult,
      resultId: 'RES-NORMAL-01',
    });
    expect(resultRecord.status).toBe('CREATED');

    // 2. Artifact Registered
    artifactRegistry.registerArtifact('RES-NORMAL-01', sampleArtifact);

    // 3. Verification Engine Run
    const newStatus = verificationEngine.verifyResult(resultRecord, true);
    expect(newStatus).toBe('VERIFIED');

    // 4. Update Status to VERIFIED (Authorized)
    registry.updateResultStatus('RES-NORMAL-01', newStatus, true);
    expect(registry.getResult('RES-NORMAL-01').status).toBe('VERIFIED');

    // Audit logs verify
    const logs = registry.getAuditLogs('RES-NORMAL-01');
    expect(logs.length).toBe(2); // REGISTER, UPDATE_STATUS
    expect(logs[1].afterStatus).toBe('VERIFIED');
  });
});
