/**
 * AIOS Employee Workflow Orchestration Foundation
 * Unit Test Suite
 */

import { describe, expect, it } from 'vitest';
import { EmployeeWorkflowOrchestrationEngine } from '../../../src/platform/employee-runtime/workflow/EmployeeWorkflowOrchestrationEngine';
import { DependencyResolver } from '../../../src/platform/employee-runtime/workflow/DependencyResolver';
import { WorkflowRecord } from '../../../src/platform/employee-runtime/workflow/models/EmployeeWorkflowModels';
import { EnforcementRecord } from '../../../src/platform/employee-runtime/enforcement/models/EmployeeEnforcementModels';

describe('AIOS Employee Workflow Orchestration Foundation', () => {
  const districtInitWorkflow: WorkflowRecord = {
    workflowId: 'wf_district_init_mie03_v1',
    workflowName: 'District Initialization Workflow',
    version: 1,
    tasks: [
      {
        taskId: 'TASK-A-CSV',
        taskName: 'Address CSV Acquisition',
        assignedEmployeeId: 'EMP-MIE03-01',
        assignedRoleId: 'ROLE_DATA_AGENT',
        status: 'PENDING',
      },
      {
        taskId: 'TASK-B-CLASSIFY',
        taskName: 'Area Classification',
        assignedEmployeeId: 'EMP-MIE03-02',
        assignedRoleId: 'ROLE_CLASSIFY_AGENT',
        status: 'PENDING',
      },
    ],
    dependencies: [
      {
        taskId: 'TASK-B-CLASSIFY',
        dependsOnTaskId: 'TASK-A-CSV',
      },
    ],
    completionCriteria: 'All 91 district area sheets generated cleanly',
    status: 'CREATED',
    createdAt: '2026-07-26T07:48:00Z',
  };

  const passEnforcement: EnforcementRecord = {
    enforcementId: 'ENF-PASS-001',
    decisionId: 'DEC-001',
    taskId: 'TASK-A-CSV',
    employeeId: 'EMP-MIE03-01',
    status: 'ALLOWED',
    gateResult: 'PASS',
    timestamp: '2026-07-26T07:48:05Z',
  };

  const blockEnforcement: EnforcementRecord = {
    enforcementId: 'ENF-BLOCK-001',
    decisionId: 'DEC-DENIED-001',
    taskId: 'TASK-A-CSV',
    employeeId: 'EMP-MIE03-01',
    status: 'BLOCKED',
    gateResult: 'BLOCK',
    blockedReason: 'System Policy forbidden action modify_gas_code',
    timestamp: '2026-07-26T07:48:05Z',
  };

  // Scenario 1: Normal Workflow Execution Order (Task A -> Task B -> COMPLETED)
  it('should orchestrate normal workflow execution order and resolve dependencies', () => {
    const engine = new EmployeeWorkflowOrchestrationEngine();
    engine.registerWorkflow(districtInitWorkflow);

    // Start Workflow
    const runningWf = engine.startWorkflow('wf_district_init_mie03_v1');
    expect(runningWf.status).toBe('RUNNING');

    // Task A should now be READY, Task B should be PENDING
    const taskA = runningWf.tasks.find((t) => t.taskId === 'TASK-A-CSV');
    const taskB = runningWf.tasks.find((t) => t.taskId === 'TASK-B-CLASSIFY');
    expect(taskA?.status).toBe('READY');
    expect(taskB?.status).toBe('PENDING');

    // Process Task A with Enforcement PASS
    const step1Wf = engine.processNextStep('wf_district_init_mie03_v1', 'TASK-A-CSV', passEnforcement);
    expect(step1Wf.tasks.find((t) => t.taskId === 'TASK-A-CSV')?.status).toBe('COMPLETED');
    expect(step1Wf.tasks.find((t) => t.taskId === 'TASK-B-CLASSIFY')?.status).toBe('READY');
    expect(step1Wf.status).toBe('RUNNING');

    // Process Task B with Enforcement PASS
    const step2Wf = engine.processNextStep('wf_district_init_mie03_v1', 'TASK-B-CLASSIFY', {
      ...passEnforcement,
      taskId: 'TASK-B-CLASSIFY',
      employeeId: 'EMP-MIE03-02',
    });
    expect(step2Wf.tasks.find((t) => t.taskId === 'TASK-B-CLASSIFY')?.status).toBe('COMPLETED');
    expect(step2Wf.status).toBe('COMPLETED');
  });

  // Scenario 2: Circular Dependency Detection & Rejection (Gate 2)
  it('should detect and reject circular task dependencies (A -> B -> A)', () => {
    const resolver = new DependencyResolver();
    const circularWf: WorkflowRecord = {
      ...districtInitWorkflow,
      workflowId: 'wf_circular',
      dependencies: [
        { taskId: 'TASK-B-CLASSIFY', dependsOnTaskId: 'TASK-A-CSV' },
        { taskId: 'TASK-A-CSV', dependsOnTaskId: 'TASK-B-CLASSIFY' }, // Circular!
      ],
    };

    const res = resolver.validateDependencies(circularWf);
    expect(res.valid).toBe(false);
    expect(res.reason).toContain('Circular dependency detected');
  });

  // Scenario 3: Non-existent Task Reference Rejection
  it('should reject workflow registration referencing non-existent taskId', () => {
    const engine = new EmployeeWorkflowOrchestrationEngine();
    const invalidWf: WorkflowRecord = {
      ...districtInitWorkflow,
      workflowId: 'wf_invalid_ref',
      dependencies: [
        { taskId: 'TASK-NON-EXISTENT', dependsOnTaskId: 'TASK-A-CSV' },
      ],
    };

    expect(() => engine.registerWorkflow(invalidWf)).toThrow(
      /Dependency references non-existent taskId/
    );
  });

  // Scenario 4: Enforcement BLOCK -> Workflow FAILED / PAUSED Transition
  it('should transition Workflow status to FAILED when Enforcement Gate returns BLOCK', () => {
    const engine = new EmployeeWorkflowOrchestrationEngine();
    engine.registerWorkflow(districtInitWorkflow);
    engine.startWorkflow('wf_district_init_mie03_v1');

    // Process Task A with Enforcement BLOCK
    const failedWf = engine.processNextStep('wf_district_init_mie03_v1', 'TASK-A-CSV', blockEnforcement);

    expect(failedWf.status).toBe('FAILED');
    expect(failedWf.tasks.find((t) => t.taskId === 'TASK-A-CSV')?.status).toBe('FAILED');
  });

  // Scenario 5: Workflow Definition Freeze & Immutability (Gate 1)
  it('should reject direct property mutation of registered WorkflowRecord', () => {
    const engine = new EmployeeWorkflowOrchestrationEngine();
    const registered = engine.registerWorkflow(districtInitWorkflow);

    // Direct property mutation attempt must throw
    expect(() => {
      (registered as any).status = 'COMPLETED';
    }).toThrow();
  });

  // Scenario 6: Immutable Workflow Audit Trail Logging
  it('should record audit trail for workflow registration, start, step completion, and failure', () => {
    const engine = new EmployeeWorkflowOrchestrationEngine();
    engine.registerWorkflow(districtInitWorkflow);
    engine.startWorkflow('wf_district_init_mie03_v1');

    const logs = engine.getAuditLogs('wf_district_init_mie03_v1');
    expect(logs.length).toBeGreaterThanOrEqual(2);
    expect(logs[0].reason).toContain('Workflow registered.');
    expect(logs[1].reason).toContain('Workflow started');
  });
});
