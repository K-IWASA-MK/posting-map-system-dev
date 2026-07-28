/**
 * test_task_intake_gateway.ts
 * 
 * AIOS Task Intake Gateway Foundation Unit Test Suite
 */

import {
  ExecutionTaskPriority,
  ExecutionTaskRegistry,
  ExecutionTaskStatus,
  TaskIntakeAuditManager,
  TaskIntakeGateway,
  TaskIntakeRequest
} from '../../../sdk/execution';
import { VerificationCapabilityType } from '../../../sdk/verification';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testNormalTaskIntake() {
  console.log('[Test 1] Normal Task Intake starting...');

  ExecutionTaskRegistry.clear();
  TaskIntakeAuditManager.clear();

  const req: TaskIntakeRequest = {
    requestId: 'REQ-20260728-001',
    sourceApplication: 'POSTING_MAP',
    title: 'Automated Spatial Data Verification Job',
    description: 'Verify spatial boundaries for Mie 03 district',
    priority: ExecutionTaskPriority.HIGH,
    requiredCapabilities: [VerificationCapabilityType.GIT_ACCESS, VerificationCapabilityType.BROWSER_AUTOMATION],
    metadata: { districtId: 'MIE-03' },
    requestedAt: new Date().toISOString()
  };

  const task = TaskIntakeGateway.submitTask(req);

  assert(task.taskId.startsWith('TASK-'), 'Task ID should start with TASK-');
  assert(task.status === ExecutionTaskStatus.CREATED, 'Initial status should be CREATED');
  assert(task.priority === ExecutionTaskPriority.HIGH, 'Priority should match request');
  assert(task.requiredCapabilities.length === 2, 'Capabilities count should match request');

  const audit = TaskIntakeAuditManager.getByRequestId(req.requestId);
  assert(audit !== undefined, 'Audit record should exist');
  assert(audit?.status === 'ACCEPTED', 'Audit status should be ACCEPTED');
  assert(audit?.taskId === task.taskId, 'Audit taskId should match generated task');

  console.log('   ✓ Normal Task Intake: PASSED');
}

async function testInvalidRequestRejection() {
  console.log('[Test 2] Invalid Request Rejection starting...');

  ExecutionTaskRegistry.clear();
  TaskIntakeAuditManager.clear();

  const invalidReq: any = {
    requestId: 'REQ-INVALID-001',
    sourceApplication: 'POSTING_MAP',
    title: '', // Empty title
    priority: 'SUPER_HIGH', // Invalid priority
    requiredCapabilities: ['INVALID_CAPABILITY'],
    requestedAt: 'invalid-date'
  };

  let rejected = false;
  try {
    TaskIntakeGateway.submitTask(invalidReq);
  } catch (err: any) {
    rejected = true;
    assert(err.message.includes('Request rejected'), 'Error message should explain rejection');
  }

  assert(rejected, 'Invalid request should be rejected');

  const auditRecords = TaskIntakeAuditManager.getAllRecords();
  assert(auditRecords.length === 1, 'Should record 1 rejected audit log');
  assert(auditRecords[0].status === 'REJECTED', 'Audit log status should be REJECTED');

  console.log('   ✓ Invalid Request Rejection: PASSED');
}

async function testPostingMapSourceMetadataTracing() {
  console.log('[Test 3] POSTING MAP Source Metadata Tracing starting...');

  ExecutionTaskRegistry.clear();
  TaskIntakeAuditManager.clear();

  const req: TaskIntakeRequest = {
    requestId: 'REQ-POSTING-100',
    sourceApplication: 'POSTING_MAP',
    title: 'Distribution Area Audit Request',
    description: 'Audit distribution areas',
    priority: ExecutionTaskPriority.NORMAL,
    requiredCapabilities: [VerificationCapabilityType.FILE_ACCESS],
    requestedAt: new Date().toISOString()
  };

  const task = TaskIntakeGateway.submitTask(req);

  assert(task.metadata !== undefined, 'Metadata should be present');
  assert(task.metadata?.intake !== undefined, 'Intake tracing object should be present');
  assert(task.metadata?.intake.sourceApplication === 'POSTING_MAP', 'sourceApplication should be POSTING_MAP');
  assert(task.metadata?.intake.requestId === 'REQ-POSTING-100', 'requestId should match');
  assert(typeof task.metadata?.intake.receivedAt === 'string', 'receivedAt timestamp should be set');

  console.log('   ✓ POSTING MAP Source Metadata Tracing: PASSED');
}

async function testRegistryIntegration() {
  console.log('[Test 4] Registry Integration starting...');

  ExecutionTaskRegistry.clear();
  TaskIntakeAuditManager.clear();

  const req: TaskIntakeRequest = {
    requestId: 'REQ-REG-01',
    sourceApplication: 'EXTERNAL_APP',
    title: 'Registry Query Test Task',
    description: 'Verify task is queryable from ExecutionTaskRegistry',
    priority: ExecutionTaskPriority.LOW,
    requiredCapabilities: [],
    requestedAt: new Date().toISOString()
  };

  const task = TaskIntakeGateway.submitTask(req);
  const fetchedTask = ExecutionTaskRegistry.get(task.taskId);

  assert(fetchedTask !== undefined, 'Task must be queryable from ExecutionTaskRegistry');
  assert(fetchedTask?.taskId === task.taskId, 'Fetched task ID must match');
  assert(fetchedTask?.status === ExecutionTaskStatus.CREATED, 'Fetched task status must be CREATED');

  console.log('   ✓ Registry Integration: PASSED');
}

async function testImmutableBoundary() {
  console.log('[Test 5] Immutable Boundary starting...');

  ExecutionTaskRegistry.clear();
  TaskIntakeAuditManager.clear();

  const req: TaskIntakeRequest = {
    requestId: 'REQ-IMMUTABLE-01',
    sourceApplication: 'POSTING_MAP',
    title: 'Immutability Check Task',
    description: 'Test frozen state',
    priority: ExecutionTaskPriority.HIGH,
    requiredCapabilities: [VerificationCapabilityType.GIT_ACCESS],
    requestedAt: new Date().toISOString()
  };

  const task = TaskIntakeGateway.submitTask(req);

  let errorThrown = false;
  try {
    (task as any).title = 'Modified Title';
  } catch (err) {
    errorThrown = true;
  }
  assert(errorThrown, 'Task object modification should be prevented (frozen)');

  console.log('   ✓ Immutable Boundary: PASSED');
}

async function runAll() {
  console.log('--- Starting AIOS Task Intake Gateway Foundation Unit Tests ---');
  await testNormalTaskIntake();
  await testInvalidRequestRejection();
  await testPostingMapSourceMetadataTracing();
  await testRegistryIntegration();
  await testImmutableBoundary();
  console.log('--- All AIOS Task Intake Gateway Foundation Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
