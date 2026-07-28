/**
 * test_autonomous_task_orchestrator.ts
 * 
 * AI Employee Autonomous Task Orchestrator Unit Test Suite (Sprint 3 - Phase 2)
 */

import { AIEmployeeRegistry } from '../../../sdk/employee/manager/registry/AIEmployeeRegistry';
import { AIEmployeeState } from '../../../sdk/employee/manager/types/AIEmployeeState';
import { AssignmentStatus } from '../../../sdk/employee/manager/types/AssignmentStatus';
import { EmployeeHealth } from '../../../sdk/employee/manager/types/EmployeeHealth';
import {
  AIEmployeeTaskOrchestrator,
  CapabilityMappingRegistry,
  ExecutionPermissionGate,
  ExecutionPermissionScope,
  ExecutionPlanRegistry,
  ExecutionStepHandlerRegistry,
  ExecutionTaskPriority,
  ExecutionTaskRegistry,
  ExecutionTaskStatus,
  TaskIntakeAuditManager,
  TaskIntakeGateway,
  TaskIntakeRequest
} from '../../../sdk/execution';
import {
  VerificationCapabilityFactory,
  VerificationCapabilityStatus,
  VerificationCapabilityType
} from '../../../sdk/verification';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testFullEndToEndAutonomousFlow() {
  console.log('[Test 1] Full End-to-End Autonomous Flow (Task Intake -> Orchestration -> Execution -> Verification -> COMPLETED) starting...');

  ExecutionTaskRegistry.clear();
  ExecutionPlanRegistry.clear();
  ExecutionPermissionGate.clearPermissions();
  ExecutionStepHandlerRegistry.clear();
  TaskIntakeAuditManager.clear();
  CapabilityMappingRegistry.clear();

  // Setup Employee Registry
  const registry = new AIEmployeeRegistry();
  const empRecord = registry.registerEmployee({
    employeeId: 'EMP-AUTO-01',
    employeeName: 'Auto Verification AI Specialist',
    employeeType: 'AGENT',
    version: '1.0.0',
    createdAt: new Date().toISOString()
  });

  registry.updateState(empRecord.identity.employeeId, AIEmployeeState.IDLE);

  // Explicitly register mapping for EMP-AUTO-01
  CapabilityMappingRegistry.registerMapping(
    'EMP-AUTO-01',
    [
      VerificationCapabilityFactory.createCapability({ type: VerificationCapabilityType.GIT_ACCESS, status: VerificationCapabilityStatus.AVAILABLE }),
      VerificationCapabilityFactory.createCapability({ type: VerificationCapabilityType.BROWSER_AUTOMATION, status: VerificationCapabilityStatus.AVAILABLE })
    ],
    [
      ExecutionPermissionScope.READ_FILE,
      ExecutionPermissionScope.WRITE_FILE,
      ExecutionPermissionScope.GIT_COMMIT,
      ExecutionPermissionScope.BROWSER_ACTION
    ]
  );

  // Submit Task via Intake Gateway
  const intakeReq: TaskIntakeRequest = {
    requestId: 'REQ-AUTO-001',
    sourceApplication: 'POSTING_MAP',
    title: 'Full Autonomous Pipeline Verification Task',
    description: 'Autonomous verification for distribution map pipeline',
    priority: ExecutionTaskPriority.HIGH,
    requiredCapabilities: [VerificationCapabilityType.GIT_ACCESS, VerificationCapabilityType.BROWSER_AUTOMATION],
    metadata: {
      repository: 'area-management/posting-map-system',
      productionUrl: 'https://area-management.github.io/posting-map-system/',
      expectedCommit: 'a1b2c3d4e5f6'
    },
    requestedAt: new Date().toISOString()
  };

  const task = TaskIntakeGateway.submitTask(intakeReq);
  assert(task.status === ExecutionTaskStatus.CREATED, 'Initial task status should be CREATED');

  // Trigger Orchestration
  const orchestrator = new AIEmployeeTaskOrchestrator();
  const result = await orchestrator.orchestrate(task.taskId, registry);

  if (result.taskStatus !== ExecutionTaskStatus.COMPLETED) {
    console.log('Result status:', result.taskStatus, 'Reason:', result.reason);
  }

  assert(result.taskStatus === ExecutionTaskStatus.COMPLETED, `Final task status should be COMPLETED, got ${result.taskStatus}`);
  assert(result.assignedEmployeeId === 'EMP-AUTO-01', 'Assigned employee should be EMP-AUTO-01');
  assert(result.planStatus === 'COMPLETED', 'Plan status should be COMPLETED');
  assert(result.executionResult?.governanceDecision === 'ALLOW', 'Governance decision should be ALLOW');

  console.log('   ✓ Full End-to-End Autonomous Flow: PASSED');
}

async function testCapabilityRejectionFlow() {
  console.log('[Test 2] Capability Rejection Flow (No eligible employee -> BLOCKED) starting...');

  ExecutionTaskRegistry.clear();
  ExecutionPlanRegistry.clear();
  ExecutionPermissionGate.clearPermissions();
  TaskIntakeAuditManager.clear();
  CapabilityMappingRegistry.clear();

  const registry = new AIEmployeeRegistry();
  const empRecord = registry.registerEmployee({
    employeeId: 'EMP-LIMITED-01',
    employeeName: 'Limited Capability AI Agent',
    employeeType: 'AGENT',
    version: '1.0.0',
    createdAt: new Date().toISOString()
  });

  registry.updateState(empRecord.identity.employeeId, AIEmployeeState.IDLE);

  // Map ONLY FILE_ACCESS to EMP-LIMITED-01
  CapabilityMappingRegistry.registerMapping(
    'EMP-LIMITED-01',
    [VerificationCapabilityFactory.createCapability({ type: VerificationCapabilityType.FILE_ACCESS, status: VerificationCapabilityStatus.AVAILABLE })],
    [ExecutionPermissionScope.READ_FILE]
  );

  // Task requires ASSET_VERSION_VERIFY
  const intakeReq: TaskIntakeRequest = {
    requestId: 'REQ-REJECT-001',
    sourceApplication: 'POSTING_MAP',
    title: 'High Security Asset Verification Task',
    description: 'Requires ASSET_VERSION_VERIFY capability',
    priority: ExecutionTaskPriority.CRITICAL,
    requiredCapabilities: [VerificationCapabilityType.ASSET_VERSION_VERIFY],
    requestedAt: new Date().toISOString()
  };

  const task = TaskIntakeGateway.submitTask(intakeReq);

  const orchestrator = new AIEmployeeTaskOrchestrator();
  const result = await orchestrator.orchestrate(task.taskId, registry);

  assert(result.taskStatus === ExecutionTaskStatus.BLOCKED, 'Task status should be BLOCKED when no matching employee');
  assert(result.reason.includes('No eligible AI employee found'), 'Reason should explain rejection');

  console.log('   ✓ Capability Rejection Flow: PASSED');
}

async function testEmployeeHealthAndStateFilterFlow() {
  console.log('[Test 3] Employee Health & State Filter Flow starting...');

  ExecutionTaskRegistry.clear();
  ExecutionPlanRegistry.clear();
  ExecutionPermissionGate.clearPermissions();
  TaskIntakeAuditManager.clear();

  const registry = new AIEmployeeRegistry();

  // Employee 1: PAUSED (Inactive state)
  const emp1 = registry.registerEmployee({
    employeeId: 'EMP-PAUSED-01',
    employeeName: 'Paused Agent',
    employeeType: 'AGENT',
    version: '1.0.0',
    createdAt: new Date().toISOString()
  });
  registry.updateState(emp1.identity.employeeId, AIEmployeeState.PAUSED);

  // Employee 2: Healthy IDLE Agent
  const emp2 = registry.registerEmployee({
    employeeId: 'EMP-HEALTHY-02',
    employeeName: 'Healthy Idle Agent',
    employeeType: 'AGENT',
    version: '1.0.0',
    createdAt: new Date().toISOString()
  });
  registry.updateState(emp2.identity.employeeId, AIEmployeeState.IDLE);
  registry.updateHealth(emp2.identity.employeeId, EmployeeHealth.NORMAL);

  const intakeReq: TaskIntakeRequest = {
    requestId: 'REQ-HEALTH-001',
    sourceApplication: 'POSTING_MAP',
    title: 'Standard Operations Task',
    description: 'Task for healthy agent',
    priority: ExecutionTaskPriority.NORMAL,
    requiredCapabilities: [VerificationCapabilityType.GIT_ACCESS],
    metadata: {
      repository: 'area-management/posting-map-system',
      productionUrl: 'https://area-management.github.io/posting-map-system/',
      expectedCommit: 'a1b2c3d4e5f6'
    },
    requestedAt: new Date().toISOString()
  };

  const task = TaskIntakeGateway.submitTask(intakeReq);

  const orchestrator = new AIEmployeeTaskOrchestrator();
  const result = await orchestrator.orchestrate(task.taskId, registry);

  assert(result.assignedEmployeeId === 'EMP-HEALTHY-02', 'Orchestrator must select the HEALTHY IDLE employee');
  assert(result.taskStatus === ExecutionTaskStatus.COMPLETED, 'Task status should be COMPLETED');

  console.log('   ✓ Employee Health & State Filter Flow: PASSED');
}

async function testMultipleEmployeeCompetitiveSelectionFlow() {
  console.log('[Test 4] Multiple Employee Competitive Selection Flow starting...');

  ExecutionTaskRegistry.clear();
  ExecutionPlanRegistry.clear();
  ExecutionPermissionGate.clearPermissions();
  TaskIntakeAuditManager.clear();
  CapabilityMappingRegistry.clear();

  const registry = new AIEmployeeRegistry();

  // Candidate A: 1 capability available (FILE_ACCESS)
  const empA = registry.registerEmployee({
    employeeId: 'EMP-CANDIDATE-A',
    employeeName: 'Candidate A',
    employeeType: 'AGENT',
    version: '1.0.0',
    createdAt: new Date().toISOString()
  });
  registry.updateState(empA.identity.employeeId, AIEmployeeState.IDLE);
  CapabilityMappingRegistry.registerMapping(
    'EMP-CANDIDATE-A',
    [
      VerificationCapabilityFactory.createCapability({ type: VerificationCapabilityType.FILE_ACCESS, status: VerificationCapabilityStatus.AVAILABLE })
    ],
    [ExecutionPermissionScope.READ_FILE]
  );

  // Candidate B: 3 capabilities available (FILE_ACCESS, GIT_ACCESS, BROWSER_AUTOMATION)
  const empB = registry.registerEmployee({
    employeeId: 'EMP-CANDIDATE-B',
    employeeName: 'Candidate B (Superior)',
    employeeType: 'AGENT',
    version: '1.0.0',
    createdAt: new Date().toISOString()
  });
  registry.updateState(empB.identity.employeeId, AIEmployeeState.IDLE);
  CapabilityMappingRegistry.registerMapping(
    'EMP-CANDIDATE-B',
    [
      VerificationCapabilityFactory.createCapability({ type: VerificationCapabilityType.FILE_ACCESS, status: VerificationCapabilityStatus.AVAILABLE }),
      VerificationCapabilityFactory.createCapability({ type: VerificationCapabilityType.GIT_ACCESS, status: VerificationCapabilityStatus.AVAILABLE }),
      VerificationCapabilityFactory.createCapability({ type: VerificationCapabilityType.BROWSER_AUTOMATION, status: VerificationCapabilityStatus.AVAILABLE })
    ],
    [
      ExecutionPermissionScope.READ_FILE,
      ExecutionPermissionScope.GIT_COMMIT,
      ExecutionPermissionScope.BROWSER_ACTION
    ]
  );

  // Task requiring FILE_ACCESS and GIT_ACCESS
  const intakeReq: TaskIntakeRequest = {
    requestId: 'REQ-COMPETITION-001',
    sourceApplication: 'POSTING_MAP',
    title: 'Multi-Capability Task',
    description: 'Requires FILE_ACCESS and GIT_ACCESS',
    priority: ExecutionTaskPriority.HIGH,
    requiredCapabilities: [VerificationCapabilityType.FILE_ACCESS, VerificationCapabilityType.GIT_ACCESS],
    metadata: {
      repository: 'area-management/posting-map-system',
      productionUrl: 'https://area-management.github.io/posting-map-system/',
      expectedCommit: 'a1b2c3d4e5f6'
    },
    requestedAt: new Date().toISOString()
  };

  const task = TaskIntakeGateway.submitTask(intakeReq);

  const orchestrator = new AIEmployeeTaskOrchestrator();
  const result = await orchestrator.orchestrate(task.taskId, registry);

  assert(result.assignedEmployeeId === 'EMP-CANDIDATE-B', 'Candidate B must be selected due to higher match score');
  assert(result.taskStatus === ExecutionTaskStatus.COMPLETED, 'Task status should be COMPLETED');

  console.log('   ✓ Multiple Employee Competitive Selection Flow: PASSED');
}

async function runAll() {
  console.log('--- Starting AI Employee Autonomous Task Orchestrator Unit Tests ---');
  await testFullEndToEndAutonomousFlow();
  await testCapabilityRejectionFlow();
  await testEmployeeHealthAndStateFilterFlow();
  await testMultipleEmployeeCompetitiveSelectionFlow();
  console.log('--- All AI Employee Autonomous Task Orchestrator Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
