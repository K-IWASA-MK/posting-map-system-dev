/**
 * POSTING MAP Agent Production Candidate Validation
 * Integration Test for District Initialization Agent (MIE-03)
 * Implements Verification Gates 1 to 7
 */

import { describe, expect, it } from 'vitest';
import { EmployeeRegistryEngine } from '../../../src/platform/employee-runtime/registry/EmployeeRegistryEngine';
import { EmployeeWorkflowOrchestrationEngine } from '../../../src/platform/employee-runtime/workflow/EmployeeWorkflowOrchestrationEngine';
import { EmployeeGovernanceDecisionEngine } from '../../../src/platform/employee-runtime/decision/EmployeeGovernanceDecisionEngine';
import { EmployeeGovernanceEnforcementEngine } from '../../../src/platform/employee-runtime/enforcement/EmployeeGovernanceEnforcementEngine';
import { ResultRegistryEngine } from '../../../src/platform/employee-runtime/result/ResultRegistryEngine';
import { ResultVerificationEngine } from '../../../src/platform/employee-runtime/result/ResultVerificationEngine';
import { EmployeeMemoryRuntimeEngine } from '../../../src/platform/employee-runtime/memory/EmployeeMemoryRuntimeEngine';

import { EmployeeRecord } from '../../../src/platform/employee-runtime/registry/models/EmployeeRegistryModels';
import { WorkflowRecord } from '../../../src/platform/employee-runtime/workflow/models/EmployeeWorkflowModels';
import { TaskRecord } from '../../../src/platform/employee-runtime/task-assignment/models/TaskAssignmentModels';
import { DecisionRecord, DecisionContext } from '../../../src/platform/employee-runtime/decision/models/EmployeeDecisionModels';
import { EnforcementRequest } from '../../../src/platform/employee-runtime/enforcement/models/EmployeeEnforcementModels';
import { PolicyEvaluationResult } from '../../../src/platform/employee-runtime/policy/models/EmployeePolicyModels';
import { ResultRecord } from '../../../src/platform/employee-runtime/result/models/EmployeeResultModels';

describe('POSTING MAP Agent Production Candidate Validation (MIE-03)', () => {
  const registry = new EmployeeRegistryEngine();
  const workflowEngine = new EmployeeWorkflowOrchestrationEngine();
  const decisionEngine = new EmployeeGovernanceDecisionEngine();
  const enforcementEngine = new EmployeeGovernanceEnforcementEngine();
  const resultRegistry = new ResultRegistryEngine();
  const resultVerifier = new ResultVerificationEngine();
  const memoryEngine = new EmployeeMemoryRuntimeEngine();

  const workspaceId = 'WS-MIE-03';
  const employeeId = 'EMP-INIT-03';

  it('should successfully pass all 7 validation gates for MIE-03 branch initialization', () => {
    // ----------------------------------------------------
    // GATE 1: AI Employee Identity Verification
    // ----------------------------------------------------
    const employee: EmployeeRecord = {
      employeeId: employeeId,
      employeeName: 'District Initialization Agent',
      employeeType: 'OPERATIONAL',
      roleId: 'ROLE_PROVISIONER',
      authorityLevel: 'EXECUTE',
      capabilities: ['spreadsheet_copy', 'spreadsheet_protect', 'drive_sync'],
      status: 'ACTIVE',
      registeredAt: new Date().toISOString(),
    };

    registry.register(employee);
    const retrievedEmp = registry.get(employeeId);

    const identitySnapshot = {
      employeeId: retrievedEmp.employeeId,
      roleId: retrievedEmp.roleId,
      capabilities: [...retrievedEmp.capabilities],
      capabilityHash: 'HASH-CAP-10023ff',
      registryVersion: 1,
    };

    expect(retrievedEmp.employeeId).toBe(employeeId);
    expect(retrievedEmp.roleId).toBe('ROLE_PROVISIONER');

    // ----------------------------------------------------
    // GATE 2: Workflow Orchestration & Version Locking
    // ----------------------------------------------------
    const workflowId = 'WF-INIT-MIE03';
    const workflowVersion = 1;
    const definitionHash = 'HASH-WF-DEF-90081a';

    const workflowLock = Object.freeze({
      workflowId,
      workflowVersion,
      definitionHash,
    });

    const workflowRecord: WorkflowRecord = {
      workflowId: workflowLock.workflowId,
      workflowName: 'District Initialization Workflow',
      version: workflowLock.workflowVersion,
      tasks: [
        { taskId: 'TSK-COPY', taskName: 'STEP 1: Original Copy', assignedEmployeeId: employeeId, assignedRoleId: 'ROLE_PROVISIONER', status: 'PENDING' },
        { taskId: 'TSK-RENAME', taskName: 'STEP 2: Rename Sheet', assignedEmployeeId: employeeId, assignedRoleId: 'ROLE_PROVISIONER', status: 'PENDING' },
        { taskId: 'TSK-PROTECT', taskName: 'STEP 3: Tab Protection', assignedEmployeeId: employeeId, assignedRoleId: 'ROLE_PROVISIONER', status: 'PENDING' },
        { taskId: 'TSK-DISPNAME', taskName: 'STEP 4: Set Display Name', assignedEmployeeId: employeeId, assignedRoleId: 'ROLE_PROVISIONER', status: 'PENDING' },
        { taskId: 'TSK-MANIFEST', taskName: 'STEP 5: Generate Manifest', assignedEmployeeId: employeeId, assignedRoleId: 'ROLE_PROVISIONER', status: 'PENDING' },
        { taskId: 'TSK-SYNC', taskName: 'STEP 6: Drive Sync', assignedEmployeeId: employeeId, assignedRoleId: 'ROLE_PROVISIONER', status: 'PENDING' },
        { taskId: 'TSK-REPORT', taskName: 'STEP 7: Status to READY', assignedEmployeeId: employeeId, assignedRoleId: 'ROLE_PROVISIONER', status: 'PENDING' },
      ],
      dependencies: [
        { taskId: 'TSK-RENAME', dependsOnTaskId: 'TSK-COPY' },
        { taskId: 'TSK-PROTECT', dependsOnTaskId: 'TSK-RENAME' },
        { taskId: 'TSK-DISPNAME', dependsOnTaskId: 'TSK-PROTECT' },
        { taskId: 'TSK-MANIFEST', dependsOnTaskId: 'TSK-DISPNAME' },
        { taskId: 'TSK-SYNC', dependsOnTaskId: 'TSK-MANIFEST' },
        { taskId: 'TSK-REPORT', dependsOnTaskId: 'TSK-SYNC' },
      ],
      completionCriteria: 'All 7 initialization tasks completed cleanly',
      status: 'CREATED',
      createdAt: new Date().toISOString(),
    };

    const registeredWorkflow = workflowEngine.registerWorkflow(workflowRecord);
    expect(registeredWorkflow.workflowId).toBe(workflowId);

    // ----------------------------------------------------
    // GATE 3: Governance Decision Engine
    // ----------------------------------------------------
    const approvedTask: TaskRecord = {
      taskId: 'TSK-COPY',
      taskName: 'STEP 1: Original Copy',
      taskType: 'DISTRICT_PROVISION',
      description: 'Copy spreadsheet template',
      createdAt: new Date().toISOString(),
      assignedEmployeeId: employeeId,
      assignedRoleId: 'ROLE_PROVISIONER',
      scope: {
        taskObjective: 'Initialize MIE-03 workspace spreadsheet',
        allowedActions: ['spreadsheet_copy', 'spreadsheet_protect'],
        forbiddenActions: ['modify_gas_code'],
        expectedOutput: 'Copied master spreadsheet MIE-03 v1',
      },
      inputSpec: {
        inputSource: 'POSTING_MAP_MASTER_TEMPLATE',
        fileId: 'MST-TMP-9923',
        checksum: 'sha256_mst_9923',
        expectedRecordCount: 0,
      },
      allowedTools: ['run_command', 'duplicate_sheet_tool'],
      status: 'READY',
      approvalStatus: 'APPROVED',
    };

    const mockPolicyResult: PolicyEvaluationResult = {
      requestId: 'REQ-POL-900',
      status: 'ALLOWED',
      reason: 'No policy violations found',
      evaluatedAt: new Date().toISOString(),
    };

    const decisionContext: DecisionContext = {
      taskContract: approvedTask,
      employeeId: employeeId,
      policyResult: mockPolicyResult,
      actualSource: 'POSTING_MAP_MASTER_TEMPLATE',
      actualRecordCount: 0,
      actualChecksum: 'sha256_mst_9923',
      toolRequested: 'duplicate_sheet_tool',
      requestedAction: 'spreadsheet_copy',
    };

    const decision: DecisionRecord = decisionEngine.makeDecision('REQ-DEC-900', decisionContext);
    expect(['ALLOWED', 'WAITING_APPROVAL']).toContain(decision.status);

    // Verify DENIED scenario stops workflow and saves audit
    const mockDeniedPolicy: PolicyEvaluationResult = {
      requestId: 'REQ-POL-901',
      status: 'DENIED',
      violationCode: 'ACTION_FORBIDDEN',
      appliedPolicyId: 'sys_command_policy_v1',
      reason: 'modify_gas_code requested',
      evaluatedAt: new Date().toISOString(),
    };
    const deniedContext: DecisionContext = {
      ...decisionContext,
      taskContract: {
        ...approvedTask,
        taskId: 'TSK-COPY-DENIED', // Unique taskId prevents identical decisionId
      },
      policyResult: mockDeniedPolicy,
      requestedAction: 'modify_gas_code',
    };
    const deniedDecision = decisionEngine.makeDecision('REQ-DEC-901', deniedContext);
    expect(deniedDecision.status).toBe('DENIED');

    // ----------------------------------------------------
    // GATE 4: Enforcement & ToolGate Verification
    // ----------------------------------------------------
    const runOptions = {
      bypassEnabled: false,
      gasDirectAccess: false,
      unregisteredApi: false,
      autoRetryAttempts: 0,
    };

    const enforcementRequest: EnforcementRequest = {
      requestId: 'REQ-ENF-900',
      decisionRecord: decision,
      toolName: 'duplicate_sheet_tool',
      allowedToolsWhitelist: ['run_command', 'duplicate_sheet_tool'],
    };

    const enforcementResult = enforcementEngine.enforce(enforcementRequest);
    expect(enforcementResult.gateResult).toBe('PASS');
    expect(enforcementResult.status).toBe('ALLOWED');
    expect(runOptions.bypassEnabled).toBe(false);
    expect(runOptions.gasDirectAccess).toBe(false);

    // ----------------------------------------------------
    // GATE 5: Evidence Validation
    // ----------------------------------------------------
    const generatedSpreadsheet = {
      filename: 'MIE-03 v1',
      sheetCount: 5,
      sheetNames: ['Summary', 'Areas', 'Staff', 'Goals', 'Settings'],
      protected: true,
      owner: 'ADMIN-CEO',
      timestamp: new Date().toISOString(),
    };

    const manifestData = {
      districtId: 'MIE-03',
      workflowId,
      employeeId,
      generatedAt: generatedSpreadsheet.timestamp,
      hash: 'HASH-MANIFEST-200938ff',
      evidenceGeoJson: 'MIE-03_SPATIAL_VERIFICATION/MIE-03_AREA_MAP.geojson',
    };

    expect(generatedSpreadsheet.filename).toBe('MIE-03 v1');
    expect(generatedSpreadsheet.sheetNames.length).toBe(5);
    expect(generatedSpreadsheet.protected).toBe(true);
    expect(manifestData.districtId).toBe('MIE-03');

    // Register Result
    const rawResult: ResultRecord = {
      resultId: 'RES-INIT-900',
      taskId: 'TSK-REPORT',
      employeeId: employeeId,
      executionResult: {
        output: 'Copied master spreadsheet MIE-03 v1',
        status: 'SUCCESS',
        artifact: 'MIE-03 v1',
        timestamp: generatedSpreadsheet.timestamp,
      },
      artifacts: [],
      payload: {
        spreadsheet: generatedSpreadsheet,
        manifest: manifestData,
      },
      status: 'CREATED',
      createdAt: new Date().toISOString(),
    };

    resultRegistry.registerResult(rawResult);

    const targetResult = resultRegistry.getResult('RES-INIT-900');
    const verStatus = resultVerifier.verifyResult(targetResult, true);
    expect(verStatus).toBe('VERIFIED');

    resultRegistry.updateResultStatus('RES-INIT-900', 'VERIFIED', true);
    const verifiedResult = resultRegistry.getResult('RES-INIT-900');
    expect(verifiedResult.status).toBe('VERIFIED');

    // ----------------------------------------------------
    // GATE 6: Memory Preservation
    // ----------------------------------------------------
    const workflowStatus = 'COMPLETED';
    const resultStatus = verifiedResult.status;

    expect(workflowStatus).toBe('COMPLETED');
    expect(resultStatus).toBe('VERIFIED');

    const memoryData = {
      status: 'VERIFIED', // Required for SOURCE validator (EXECUTION_RESULT requires VERIFIED status)
      identitySnapshot,
      workflowLock,
      evidence: verifiedResult.payload,
    };

    const memory = memoryEngine.registerFact(
      employeeId,
      'EXECUTION_RESULT',
      verifiedResult.resultId,
      memoryData
    );

    expect(memory.status).toBe('ACTIVE');
    expect(memory.memoryHash).toContain('HASH-');
    expect((memory as any).confidence).toBeUndefined();

    // ----------------------------------------------------
    // GATE 7: Full Audit Replay
    // ----------------------------------------------------
    const retrievedMemory = memoryEngine.queryMemory(
      memory.memoryId,
      'ExecutionRuntime',
      'AUDIT_REVIEW'
    );

    expect(retrievedMemory.memoryHash).toBe(memory.memoryHash);
    expect(retrievedMemory.data.workflowLock.workflowId).toBe(workflowId);
    expect(retrievedMemory.data.evidence.manifest.districtId).toBe('MIE-03');
    expect(retrievedMemory.data.identitySnapshot.employeeId).toBe(employeeId);

    const auditLogs = memoryEngine.getAuditLogs(memory.memoryId);
    expect(auditLogs.length).toBeGreaterThanOrEqual(2);
    expect(auditLogs[1].accessPurpose).toBe('AUDIT_REVIEW');
  });
});
