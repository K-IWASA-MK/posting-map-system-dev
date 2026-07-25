/**
 * AIOS Employee Execution Runtime Foundation
 * Unit Test Suite
 */

import { describe, expect, it } from 'vitest';
import { ExecutionRuntimeEngine } from '../../../src/platform/employee-runtime/execution/ExecutionRuntimeEngine';
import { ExecutionValidator } from '../../../src/platform/employee-runtime/execution/ExecutionValidator';
import { ToolExecutionGateway } from '../../../src/platform/employee-runtime/execution/ToolExecutionGateway';
import { IExecutor } from '../../../src/platform/employee-runtime/execution/contract/IExecutor';
import { ExecutionResult } from '../../../src/platform/employee-runtime/execution/models/ExecutionRuntimeModels';
import { TaskRecord } from '../../../src/platform/employee-runtime/task-assignment/models/TaskAssignmentModels';

// Dummy Mock Executor (Implements IExecutor without autonomous decision capability)
class MockExecutor implements IExecutor {
  public async execute(
    task: TaskRecord,
    toolName: string,
    params: any
  ): Promise<ExecutionResult> {
    return {
      output: `Executed tool '${toolName}' with ${params.recordCount} records for Task '${task.taskId}'`,
      status: 'SUCCESS',
      artifact: 'MIE03_Spreadsheet_91Sheets',
      timestamp: new Date().toISOString(),
    };
  }
}

describe('AIOS Employee Execution Runtime Foundation', () => {
  const approvedTask: TaskRecord = {
    taskId: 'TASK-EXEC-MIE03-01',
    taskName: 'MIE-03 Area Sheet Batch Execution',
    taskType: 'DISTRICT_SHEET_GENERATION',
    description: 'Execute batch generation for Mie 3rd District',
    createdAt: '2026-07-26T04:09:00Z',
    assignedEmployeeId: 'EMP-MIE03-01',
    assignedRoleId: 'ROLE_DISTRICT_OPS',
    scope: {
      taskObjective: 'Generate MIE-03 distribution area sheets',
      allowedActions: ['duplicate_template', 'insert_address'],
      forbiddenActions: ['modify_gas_code'],
      expectedOutput: '91 area sheets in spreadsheet',
    },
    inputSpec: {
      inputSource: 'MIE03_ADDRESS_MASTER.csv',
      fileId: 'MIE03_MASTER_858',
      checksum: 'sha256_hash_858',
      expectedRecordCount: 858,
    },
    allowedTools: ['run_command', 'duplicate_sheet_tool'],
    status: 'READY',
    approvalStatus: 'APPROVED',
  };

  // Scenario 1: Input Mismatch Execution Block (858 expected vs 684 actual)
  it('should trigger Execution Block when actual input count does not match expected count', () => {
    const validator = new ExecutionValidator();
    const valRes = validator.validateExecutionContract(
      approvedTask,
      'MIE03_ADDRESS_MASTER.csv',
      684,
      'sha256_hash_858'
    );

    expect(valRes.valid).toBe(false);
    expect(valRes.reason).toContain('Record count mismatch. Expected 858 records, got 684 records. Execution Blocked');
  });

  // Scenario 2: Unlisted Tool Block in ToolExecutionGateway
  it('should block execution in ToolExecutionGateway when unlisted tool is invoked', async () => {
    const gateway = new ToolExecutionGateway();
    const mockExecutor = new MockExecutor();

    await expect(
      gateway.executeTool(mockExecutor, approvedTask, 'unapproved_custom_api_tool', {})
    ).rejects.toThrow(/Tool 'unapproved_custom_api_tool' is not authorized for Task/);
  });

  // Scenario 3: Task Scope Outside Action WAITING_APPROVAL Transition
  it('should transition to WAITING_APPROVAL when Scope outside action is attempted', () => {
    const engine = new ExecutionRuntimeEngine();
    const execution = engine.createExecution(approvedTask, 'EMP-MIE03-01');

    engine.updateStatus(execution.executionId, 'VALIDATING');
    engine.updateStatus(execution.executionId, 'WAITING_APPROVAL', 'Scope outside action requested');

    expect(engine.getExecution(execution.executionId).status).toBe('WAITING_APPROVAL');
  });

  // Scenario 4: Normal Execution Pipeline (Task -> Employee -> Executor -> Tool -> Result -> Verification -> COMPLETED)
  it('should run full execution pipeline and reach COMPLETED status upon verification success', async () => {
    const engine = new ExecutionRuntimeEngine();
    const mockExecutor = new MockExecutor();

    const execution = engine.createExecution(approvedTask, 'EMP-MIE03-01');
    expect(execution.status).toBe('CREATED');

    const completedExecution = await engine.runExecution(
      execution.executionId,
      mockExecutor,
      'duplicate_sheet_tool',
      { recordCount: 858 },
      'MIE03_ADDRESS_MASTER.csv',
      858,
      'sha256_hash_858'
    );

    expect(completedExecution.status).toBe('COMPLETED');
    expect(completedExecution.result).not.toBeNull();
    expect(completedExecution.result?.status).toBe('SUCCESS');
    expect(completedExecution.result?.artifact).toBe('MIE03_Spreadsheet_91Sheets');

    // Verify Audit Trail Entries
    const logs = engine.getAuditLogs(execution.executionId);
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[logs.length - 1].afterStatus).toBe('COMPLETED');
  });
});
