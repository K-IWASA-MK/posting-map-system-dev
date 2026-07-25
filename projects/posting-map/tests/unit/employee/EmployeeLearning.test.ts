/**
 * AIOS Employee Learning Foundation
 * Unit Test Suite
 */

import { describe, expect, it } from 'vitest';
import { KnowledgeCandidateEngine } from '../../../src/platform/employee-runtime/learning/KnowledgeCandidateEngine';
import { LearningApprovalEngine } from '../../../src/platform/employee-runtime/learning/LearningApprovalEngine';
import { LearningRegistryEngine } from '../../../src/platform/employee-runtime/learning/LearningRegistryEngine';
import { ResultRecord } from '../../../src/platform/employee-runtime/result/models/EmployeeResultModels';

describe('AIOS Employee Learning Foundation', () => {
  const verifiedResult: ResultRecord = {
    resultId: 'RES-VERIFIED-858',
    executionId: 'EXEC-TASK-858',
    taskId: 'TASK-858',
    employeeId: 'EMP-MIE03-01',
    executionResult: {
      output: '858 addresses processed successfully',
      status: 'SUCCESS',
      artifact: 'MIE03_Spreadsheet_91Sheets',
      timestamp: '2026-07-26T04:20:00Z',
    },
    artifacts: [],
    status: 'VERIFIED',
    createdAt: '2026-07-26T04:20:00Z',
  };

  const unverifiedResult: ResultRecord = {
    ...verifiedResult,
    resultId: 'RES-UNVERIFIED-684',
    status: 'CREATED', // Not VERIFIED
  };

  // Scenario 1: Rejection of Unverified Result Input
  it('should block knowledge candidate extraction from an unverified Result', () => {
    const candidateEngine = new KnowledgeCandidateEngine();

    expect(() =>
      candidateEngine.extractCandidate(unverifiedResult, 'OPTIMIZED_BATCH_INSERT', 0.95)
    ).toThrow(/Cannot extract Knowledge Candidate from Result 'RES-UNVERIFIED-684' with status 'CREATED'/);
  });

  // Scenario 2: Successful Knowledge Candidate Extraction from VERIFIED Result
  it('should successfully extract Knowledge Candidate from a VERIFIED Result', () => {
    const candidateEngine = new KnowledgeCandidateEngine();
    const record = candidateEngine.extractCandidate(verifiedResult, 'OPTIMIZED_BATCH_INSERT', 0.95);

    expect(record.status).toBe('CREATED');
    expect(record.candidate.pattern).toBe('OPTIMIZED_BATCH_INSERT');
    expect(record.candidate.confidence).toBe(0.95);
    expect(record.sourceResultId).toBe('RES-VERIFIED-858');
  });

  // Scenario 3: Registration & Duplicate LearningId Rejection
  it('should register Knowledge Candidate record and reject duplicate LearningId', () => {
    const candidateEngine = new KnowledgeCandidateEngine();
    const registry = new LearningRegistryEngine();

    const record = candidateEngine.extractCandidate(verifiedResult, 'OPTIMIZED_BATCH_INSERT', 0.95);
    const registered = registry.registerRecord(record);

    expect(registered.learningId).toBe(record.learningId);
    expect(registry.getRecord(record.learningId).candidate.pattern).toBe('OPTIMIZED_BATCH_INSERT');

    // Duplicate Registration attempt
    expect(() => registry.registerRecord(record)).toThrow(/LearningId .* already exists/);
  });

  // Scenario 4: Usage Reference Gating (Before APPROVED -> BLOCK, After APPROVED -> ALLOWED)
  it('should block usage/reference of unapproved Candidate and allow reference after APPROVED', () => {
    const candidateEngine = new KnowledgeCandidateEngine();
    const registry = new LearningRegistryEngine();
    const approvalEngine = new LearningApprovalEngine();

    const record = candidateEngine.extractCandidate(verifiedResult, 'OPTIMIZED_BATCH_INSERT', 0.95);
    registry.registerRecord(record);

    // 1. Check Usage Allowed before Approval (Must be BLOCKED)
    const valBefore = approvalEngine.validateUsageAllowed(record);
    expect(valBefore.allowed).toBe(false);
    expect(valBefore.reason).toContain('is not approved (Current Status: \'CREATED\')');

    // 2. Approve with Manager Authorization
    const appStatus = approvalEngine.approveCandidate(record, true);
    expect(appStatus).toBe('APPROVED');

    registry.updateRecordStatus(record.learningId, 'APPROVED', true);
    const updatedRecord = registry.getRecord(record.learningId);

    // 3. Check Usage Allowed after Approval (Must be ALLOWED)
    const valAfter = approvalEngine.validateUsageAllowed(updatedRecord);
    expect(valAfter.allowed).toBe(true);
  });

  // Scenario 5: Rejection Flow (REVIEWING -> REJECTED & Usage Blocked)
  it('should handle REJECTED candidate status and block reference usage', () => {
    const candidateEngine = new KnowledgeCandidateEngine();
    const registry = new LearningRegistryEngine();
    const approvalEngine = new LearningApprovalEngine();

    const record = candidateEngine.extractCandidate(verifiedResult, 'FAULTY_RETRY_PATTERN', 0.40);
    registry.registerRecord(record);

    // Transition to REVIEWING -> REJECTED
    registry.updateRecordStatus(record.learningId, 'REVIEWING', false);
    const rejectedStatus = approvalEngine.rejectCandidate(registry.getRecord(record.learningId));
    expect(rejectedStatus).toBe('REJECTED');

    registry.updateRecordStatus(record.learningId, 'REJECTED', false);
    const rejectedRecord = registry.getRecord(record.learningId);

    expect(rejectedRecord.status).toBe('REJECTED');

    // Usage check (Must be BLOCKED)
    const valUsage = approvalEngine.validateUsageAllowed(rejectedRecord);
    expect(valUsage.allowed).toBe(false);

    // Attempting to approve REJECTED candidate must fail
    expect(() => approvalEngine.approveCandidate(rejectedRecord, true)).toThrow(
      /Cannot transition Learning candidate .* from 'REJECTED' to 'APPROVED'/
    );
  });

  // Scenario 6: Audit History Verification
  it('should record audit trail for candidate extraction and status updates', () => {
    const candidateEngine = new KnowledgeCandidateEngine();
    const registry = new LearningRegistryEngine();

    const record = candidateEngine.extractCandidate(verifiedResult, 'AUDITED_PATTERN', 0.88);
    registry.registerRecord(record);
    registry.updateRecordStatus(record.learningId, 'REVIEWING', false);

    const logs = registry.getAuditLogs(record.learningId);
    expect(logs.length).toBe(2); // EXTRACT_CANDIDATE, UPDATE_STATUS
    expect(logs[0].action).toBe('EXTRACT_CANDIDATE');
    expect(logs[1].afterStatus).toBe('REVIEWING');
  });
});
