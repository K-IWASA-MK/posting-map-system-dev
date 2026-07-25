/**
 * AIOS Knowledge Runtime Foundation
 * Unit Test Suite
 */

import { describe, expect, it } from 'vitest';
import { LearningRecord } from '../../../src/platform/employee-runtime/learning/models/EmployeeLearningModels';
import { KnowledgeAccessGuard } from '../../../src/platform/employee-runtime/knowledge/KnowledgeAccessGuard';
import { KnowledgeRuntimeEngine } from '../../../src/platform/employee-runtime/knowledge/KnowledgeRuntimeEngine';

describe('AIOS Knowledge Runtime Foundation', () => {
  const approvedLearning: LearningRecord = {
    learningId: 'LRN-APPROVED-01',
    sourceResultId: 'RES-858',
    employeeId: 'EMP-MIE03-01',
    taskId: 'TASK-858',
    candidate: {
      pattern: 'HIGH_THROUGHPUT_BATCH_GEN',
      evidence: 'Result:RES-858|Execution:EXEC-858',
      confidence: 0.98,
      status: 'APPROVED',
    },
    status: 'APPROVED',
    createdAt: '2026-07-26T04:25:00Z',
  };

  const reviewingLearning: LearningRecord = {
    ...approvedLearning,
    learningId: 'LRN-REVIEWING-02',
    candidate: {
      ...approvedLearning.candidate,
      status: 'REVIEWING',
    },
    status: 'REVIEWING',
  };

  const rejectedLearning: LearningRecord = {
    ...approvedLearning,
    learningId: 'LRN-REJECTED-03',
    candidate: {
      ...approvedLearning.candidate,
      status: 'REJECTED',
    },
    status: 'REJECTED',
  };

  // Scenario 1: APPROVED Knowledge Indexing & Retrieval Success
  it('should successfully index and retrieve APPROVED Knowledge', () => {
    const engine = new KnowledgeRuntimeEngine();
    const ref = engine.indexApprovedKnowledge(approvedLearning);

    expect(ref.knowledgeId).toBe('KNOW-LRN-APPROVED-01');
    expect(ref.status).toBe('APPROVED');
    expect(ref.version).toBe(1);
    expect(engine.getKnowledge(ref.knowledgeId).pattern).toBe('HIGH_THROUGHPUT_BATCH_GEN');
  });

  // Scenario 2: REVIEWING Knowledge Access Rejection
  it('should block indexing or accessing REVIEWING Knowledge', () => {
    const engine = new KnowledgeRuntimeEngine();
    const guard = new KnowledgeAccessGuard();

    expect(() => engine.indexApprovedKnowledge(reviewingLearning)).toThrow(
      /Item is in 'REVIEWING' status. Only 'APPROVED' Knowledge can be accessed/
    );

    const guardRes = guard.validateAccess(reviewingLearning);
    expect(guardRes.allowed).toBe(false);
  });

  // Scenario 3: REJECTED Knowledge Access Rejection
  it('should block indexing or accessing REJECTED Knowledge', () => {
    const engine = new KnowledgeRuntimeEngine();
    const guard = new KnowledgeAccessGuard();

    expect(() => engine.indexApprovedKnowledge(rejectedLearning)).toThrow(
      /Item is in 'REJECTED' status. Only 'APPROVED' Knowledge can be accessed/
    );

    const guardRes = guard.validateAccess(rejectedLearning);
    expect(guardRes.allowed).toBe(false);
  });

  // Scenario 4: Context Modification Rejection (Immutable KnowledgeContext)
  it('should reject modification of generated KnowledgeContext (Read-Only immutability)', () => {
    const engine = new KnowledgeRuntimeEngine();
    engine.indexApprovedKnowledge(approvedLearning);

    const context = engine.createKnowledgeContext('TASK-858', 'EMP-MIE03-01', 'REQ-001', {
      pattern: 'HIGH_THROUGHPUT_BATCH_GEN',
    });

    expect(context.references.length).toBe(1);

    // Attempting to mutate context object must fail
    expect(() => {
      (context as any).taskId = 'TASK-MUTATED';
    }).toThrow();
  });

  // Scenario 5: Direct Version Modification Rejection
  it('should reject direct modification of indexed KnowledgeReference version', () => {
    const engine = new KnowledgeRuntimeEngine();
    const ref = engine.indexApprovedKnowledge(approvedLearning);

    // Attempting to directly mutate version property on frozen reference must fail
    expect(() => {
      (ref as any).version = 999;
    }).toThrow();
  });

  // Scenario 6: Version 2 Generation & Latest Version Retrieval
  it('should generate Version 2 for updated Knowledge without modifying Version 1', () => {
    const engine = new KnowledgeRuntimeEngine();
    const v1Ref = engine.indexApprovedKnowledge(approvedLearning);

    const updatedLearning: LearningRecord = {
      ...approvedLearning,
      learningId: 'LRN-APPROVED-01-V2',
      candidate: {
        ...approvedLearning.candidate,
        confidence: 0.99,
      },
    };

    const v2Ref = engine.createNewVersion(v1Ref.knowledgeId, updatedLearning);

    expect(v1Ref.version).toBe(1);
    expect(v2Ref.version).toBe(2);
    expect(v2Ref.confidence).toBe(0.99);

    const allPatternRefs = engine.findByPattern('HIGH_THROUGHPUT_BATCH_GEN');
    expect(allPatternRefs.length).toBe(2);
  });

  // Scenario 7: Access Audit Logging & Execution Context Delivery Verification
  it('should record access audit logs and deliver read-only reference Context to Execution Runtime', () => {
    const engine = new KnowledgeRuntimeEngine();
    engine.indexApprovedKnowledge(approvedLearning);

    const context = engine.createKnowledgeContext('TASK-EXEC-858', 'EMP-MIE03-01', 'REQ-EXEC-101');
    expect(context.references[0].pattern).toBe('HIGH_THROUGHPUT_BATCH_GEN');

    const auditLogs = engine.getAuditLogs();
    expect(auditLogs.length).toBe(1);
    expect(auditLogs[0].taskId).toBe('TASK-EXEC-858');
    expect(auditLogs[0].resultStatus).toBe('ALLOWED');
  });
});
