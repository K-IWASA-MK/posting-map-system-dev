/**
 * AIOS Task Assignment Foundation
 * Unit Test Suite
 */

import { describe, expect, it } from 'vitest';
import { EmployeeRegistryEngine } from '../../../src/platform/employee-runtime/registry/EmployeeRegistryEngine';
import { TaskAssignmentEngine } from '../../../src/platform/employee-runtime/task-assignment/TaskAssignmentEngine';
import { TaskAssignmentValidator } from '../../../src/platform/employee-runtime/task-assignment/TaskAssignmentValidator';
import { TaskRecord } from '../../../src/platform/employee-runtime/task-assignment/models/TaskAssignmentModels';

describe('AIOS Task Assignment Foundation', () => {
  const registry = new EmployeeRegistryEngine();
  registry.register({
    employeeId: 'EMP-MIE03-01',
    employeeName: 'Mie District Agent',
    employeeType: 'OPERATIONAL',
    roleId: 'ROLE_DISTRICT_OPS',
    authorityLevel: 'EXECUTE',
    capabilities: ['sheet_generation'],
    status: 'ACTIVE',
    registeredAt: '2026-07-26T04:00:00Z',
  });

  const sampleTask: TaskRecord = {
    taskId: 'TASK-MIE03-GEN-01',
    taskName: 'MIE-03 Area Sheet Generation',
    taskType: 'DISTRICT_SHEET_GENERATION',
    description: 'Generate 91 area sheets for Mie 3rd District using MIE03_ADDRESS_MASTER.csv',
    createdAt: '2026-07-26T04:00:00Z',
    assignedEmployeeId: null,
    assignedRoleId: 'ROLE_DISTRICT_OPS',
    scope: {
      taskObjective: 'Generate MIE-03 distribution area sheets',
      allowedActions: ['duplicate_template', 'insert_address', 'bind_map_link'],
      forbiddenActions: ['modify_gas_code', 'run_simulation_as_final'],
      expectedOutput: '91 area sheets created in Google Spreadsheet',
    },
    inputSpec: {
      inputSource: 'MIE03_ADDRESS_MASTER.csv',
      fileId: 'MIE03_MASTER_CSV_858',
      checksum: 'sha256_mie03_master_hash',
      expectedRecordCount: 858,
    },
    allowedTools: ['run_command', 'view_file', 'write_to_file'],
    status: 'CREATED',
    approvalStatus: 'PENDING',
  };

  // Scenario 1: Unapproved Task Execution Block
  it('should block execution of an unapproved (PENDING/REJECTED) Task', () => {
    const engine = new TaskAssignmentEngine(registry);
    const validator = new TaskAssignmentValidator();

    const created = engine.createTask(sampleTask);
    const valRes = validator.validateApproval(created);

    expect(valRes.valid).toBe(false);
    expect(valRes.reason).toContain("Task 'TASK-MIE03-GEN-01' is not approved. Current status is 'PENDING'");
  });

  // Scenario 2: Input Mismatch Block (Expected 858 vs Actual 684)
  it('should block execution when actual input record count does not match expected count', () => {
    const validator = new TaskAssignmentValidator();

    // Actual input from old CSV with 684 records
    const valRes = validator.validateInput(
      sampleTask,
      'MIE03_ADDRESS_MASTER.csv',
      684,
      'sha256_mie03_master_hash'
    );

    expect(valRes.valid).toBe(false);
    expect(valRes.reason).toContain('Record count mismatch. Expected 858 records, got 684 records. Execution Blocked');
  });

  // Scenario 3: Unlisted Tool Block
  it('should block execution when an unlisted tool is used', () => {
    const validator = new TaskAssignmentValidator();

    const valRes = validator.validateTool(sampleTask, 'unapproved_custom_script_tool');
    expect(valRes.valid).toBe(false);
    expect(valRes.reason).toContain("Tool 'unapproved_custom_script_tool' is not in allowedTools whitelist");
  });

  // Scenario 4: Scope Outside Action Rejection
  it('should reject action outside Task scope and indicate WAITING_APPROVAL requirement', () => {
    const validator = new TaskAssignmentValidator();

    const valRes = validator.validateAction(sampleTask, 'unauthorized_code_optimization');
    expect(valRes.valid).toBe(false);
    expect(valRes.reason).toContain('Must transition to WAITING_APPROVAL');
  });

  // Scenario 5: Normal Task Flow (CREATED -> ASSIGNED -> VALIDATING -> READY)
  it('should successfully progress a normal task through CREATED -> ASSIGNED -> VALIDATING -> READY upon approval', () => {
    const engine = new TaskAssignmentEngine(registry);
    const validator = new TaskAssignmentValidator();

    // 1. CREATED
    const task = engine.createTask({ ...sampleTask, taskId: 'TASK-MIE03-GEN-NORMAL' });
    expect(task.status).toBe('CREATED');

    // 2. ASSIGNED to valid Employee
    engine.assignEmployee(task.taskId, 'EMP-MIE03-01', 'ROLE_DISTRICT_OPS');
    expect(task.status).toBe('ASSIGNED');
    expect(task.assignedEmployeeId).toBe('EMP-MIE03-01');

    // 3. APPROVE Task
    engine.setApprovalStatus(task.taskId, 'APPROVED');
    expect(validator.validateApproval(task).valid).toBe(true);

    // 4. VALIDATING
    engine.updateTaskStatus(task.taskId, 'VALIDATING');
    expect(task.status).toBe('VALIDATING');

    // Validate Input & Tool
    const inputVal = validator.validateInput(
      task,
      'MIE03_ADDRESS_MASTER.csv',
      858,
      'sha256_mie03_master_hash'
    );
    expect(inputVal.valid).toBe(true);

    // 5. READY
    engine.updateTaskStatus(task.taskId, 'READY');
    expect(task.status).toBe('READY');

    // Audit logs verify
    const logs = engine.getAuditLogs(task.taskId);
    expect(logs.length).toBe(5); // CREATE, ASSIGN, APPROVE, UPDATE_STATUS(VALIDATING), UPDATE_STATUS(READY)
  });
});
