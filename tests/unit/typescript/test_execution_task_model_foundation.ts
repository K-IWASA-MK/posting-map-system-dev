/**
 * test_execution_task_model_foundation.ts
 * 
 * Execution Task Model Foundation Unit Test Suite
 */

import {
  ExecutionTaskFactory,
  ExecutionTaskPriority,
  ExecutionTaskStatus,
  ExecutionTaskValidator
} from '../../../sdk/execution';
import { VerificationCapabilityType } from '../../../sdk/verification';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testTaskCreationAndValidation() {
  console.log('[Test] ExecutionTask Creation & Validation starting...');

  const task = ExecutionTaskFactory.createTask({
    title: 'POSTING MAP Production Verification',
    description: 'Verify deployment status and browser rendering on GitHub Pages',
    priority: ExecutionTaskPriority.HIGH,
    assignedEmployeeId: 'EMP-AI-DEV-01',
    requiredCapabilities: [
      VerificationCapabilityType.GIT_ACCESS,
      VerificationCapabilityType.GITHUB_ACTION_STATUS,
      VerificationCapabilityType.DEPLOYMENT_STATUS,
      VerificationCapabilityType.BROWSER_AUTOMATION
    ],
    metadata: {
      requester: 'Iwasa CEO',
      project: 'posting-map-system',
      evidenceRequired: true
    }
  });

  assert(Boolean(task.taskId.startsWith('TASK-')), 'Task ID should start with TASK-');
  assert(task.title === 'POSTING MAP Production Verification', 'Title mismatch');
  assert(task.priority === ExecutionTaskPriority.HIGH, 'Priority mismatch');
  assert(task.status === ExecutionTaskStatus.CREATED, 'Initial status should be CREATED');
  assert(task.assignedEmployeeId === 'EMP-AI-DEV-01', 'Assigned employee mismatch');
  assert(task.requiredCapabilities.length === 4, 'Required capabilities count mismatch');
  assert(task.requiredCapabilities.includes(VerificationCapabilityType.GITHUB_ACTION_STATUS), 'Should include GITHUB_ACTION_STATUS');
  assert(task.metadata?.requester === 'Iwasa CEO', 'Metadata requester mismatch');
  assert(ExecutionTaskValidator.validateTask(task), 'Task validation should pass');

  console.log('   ✓ ExecutionTask Creation & Validation: PASSED');
}

async function testInvalidTaskRejection() {
  console.log('[Test] Invalid Task Rejection starting...');

  // Empty title
  assert(!ExecutionTaskValidator.validateTask({
    taskId: 'TASK-20260728-100001',
    title: '',
    description: 'Empty title test',
    priority: ExecutionTaskPriority.NORMAL,
    requiredCapabilities: [],
    status: ExecutionTaskStatus.CREATED,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }), 'Validator should reject empty title');

  // Invalid priority
  assert(!ExecutionTaskValidator.validateTask({
    taskId: 'TASK-20260728-100002',
    title: 'Invalid Priority Task',
    description: 'Test',
    priority: 'SUPER_HIGH',
    requiredCapabilities: [],
    status: ExecutionTaskStatus.CREATED,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }), 'Validator should reject invalid priority');

  // Invalid status
  assert(!ExecutionTaskValidator.validateTask({
    taskId: 'TASK-20260728-100003',
    title: 'Invalid Status Task',
    description: 'Test',
    priority: ExecutionTaskPriority.NORMAL,
    requiredCapabilities: [],
    status: 'PENDING_APPROVAL',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }), 'Validator should reject invalid status');

  // Invalid capability in requiredCapabilities
  assert(!ExecutionTaskValidator.validateTask({
    taskId: 'TASK-20260728-100004',
    title: 'Invalid Capability Task',
    description: 'Test',
    priority: ExecutionTaskPriority.NORMAL,
    requiredCapabilities: ['MAGIC_CAPABILITY'],
    status: ExecutionTaskStatus.CREATED,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }), 'Validator should reject invalid capability type');

  // Factory throws error on invalid parameters
  let errorThrown = false;
  try {
    ExecutionTaskFactory.createTask({
      title: '',
      priority: ExecutionTaskPriority.NORMAL
    });
  } catch (err) {
    errorThrown = true;
  }
  assert(errorThrown, 'Factory should throw error on invalid title');

  console.log('   ✓ Invalid Task Rejection: PASSED');
}

async function testImmutability() {
  console.log('[Test] Task Immutability starting...');

  const task = ExecutionTaskFactory.createTask({
    title: 'Immutable Task Test',
    requiredCapabilities: [VerificationCapabilityType.FILE_ACCESS],
    metadata: { key: 'value' }
  });

  let mutated = false;
  try {
    (task as any).status = ExecutionTaskStatus.RUNNING;
  } catch (err) {
    mutated = true;
  }
  assert(mutated || task.status === ExecutionTaskStatus.CREATED, 'Task status should be immutable');

  let arrayMutated = false;
  try {
    (task.requiredCapabilities as any).push(VerificationCapabilityType.GIT_ACCESS);
  } catch (err) {
    arrayMutated = true;
  }
  assert(arrayMutated || task.requiredCapabilities.length === 1, 'requiredCapabilities array should be frozen');

  console.log('   ✓ Task Immutability: PASSED');
}

async function runAll() {
  console.log('--- Starting Execution Task Model Foundation Unit Tests ---');
  await testTaskCreationAndValidation();
  await testInvalidTaskRejection();
  await testImmutability();
  console.log('--- All Execution Task Model Foundation Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
