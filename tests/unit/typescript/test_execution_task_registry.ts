/**
 * test_execution_task_registry.ts
 * 
 * Execution Task Registry Unit Test Suite (Sprint 2 - Phase 2)
 */

import {
  ExecutionTaskFactory,
  ExecutionTaskPriority,
  ExecutionTaskRegistry,
  ExecutionTaskStatus
} from '../../../sdk/execution';
import { VerificationCapabilityType } from '../../../sdk/verification';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testTaskRegistrationAndDuplicatePrevention() {
  console.log('[Test] Task Registration & Duplicate Prevention starting...');

  ExecutionTaskRegistry.clear();

  const task1 = ExecutionTaskFactory.createTask({
    taskId: 'TASK-REG-01',
    title: 'Deploy Verification Task',
    priority: ExecutionTaskPriority.HIGH,
    requiredCapabilities: [VerificationCapabilityType.GIT_ACCESS, VerificationCapabilityType.DEPLOYMENT_STATUS]
  });

  ExecutionTaskRegistry.register(task1);
  assert(ExecutionTaskRegistry.getAll().length === 1, 'Registry should contain 1 task');

  let errorThrown = false;
  try {
    ExecutionTaskRegistry.register(task1);
  } catch (err) {
    errorThrown = true;
  }
  assert(errorThrown, 'Registering duplicate task ID must throw Error');

  console.log('   ✓ Task Registration & Duplicate Prevention: PASSED');
}

async function testTaskQueryingAndFiltering() {
  console.log('[Test] Task Querying & Filtering starting...');

  ExecutionTaskRegistry.clear();

  const t1 = ExecutionTaskFactory.createTask({
    taskId: 'TASK-Q-01',
    title: 'Browser Rendering Audit',
    priority: ExecutionTaskPriority.CRITICAL,
    status: ExecutionTaskStatus.CREATED,
    requiredCapabilities: [VerificationCapabilityType.BROWSER_AUTOMATION]
  });

  const t2 = ExecutionTaskFactory.createTask({
    taskId: 'TASK-Q-02',
    title: 'Git Status Check',
    priority: ExecutionTaskPriority.NORMAL,
    status: ExecutionTaskStatus.RUNNING,
    assignedEmployeeId: 'EMP-01',
    requiredCapabilities: [VerificationCapabilityType.GIT_ACCESS]
  });

  const t3 = ExecutionTaskFactory.createTask({
    taskId: 'TASK-Q-03',
    title: 'CDP Protocol Inspection',
    priority: ExecutionTaskPriority.CRITICAL,
    status: ExecutionTaskStatus.CREATED,
    assignedEmployeeId: 'EMP-01',
    requiredCapabilities: [VerificationCapabilityType.CDP_ENDPOINT, VerificationCapabilityType.BROWSER_AUTOMATION]
  });

  ExecutionTaskRegistry.registerMany([t1, t2, t3]);

  // ID lookup
  assert(ExecutionTaskRegistry.get('TASK-Q-01')?.title === 'Browser Rendering Audit', 'ID lookup mismatch');

  // Status lookup
  assert(ExecutionTaskRegistry.getByStatus(ExecutionTaskStatus.CREATED).length === 2, 'CREATED status count should be 2');
  assert(ExecutionTaskRegistry.getByStatus(ExecutionTaskStatus.RUNNING).length === 1, 'RUNNING status count should be 1');

  // Priority lookup
  assert(ExecutionTaskRegistry.getByPriority(ExecutionTaskPriority.CRITICAL).length === 2, 'CRITICAL priority count should be 2');

  // Employee lookup
  assert(ExecutionTaskRegistry.getByAssignedEmployee('EMP-01').length === 2, 'Employee EMP-01 task count should be 2');

  // Capability lookup
  assert(ExecutionTaskRegistry.getByCapability(VerificationCapabilityType.BROWSER_AUTOMATION).length === 2, 'BROWSER_AUTOMATION capability count should be 2');

  console.log('   ✓ Task Querying & Filtering: PASSED');
}

async function testTaskAssignmentAndStatusUpdates() {
  console.log('[Test] Task Assignment & Status Updates starting...');

  ExecutionTaskRegistry.clear();

  const task = ExecutionTaskFactory.createTask({
    taskId: 'TASK-ASSIGN-01',
    title: 'Field Operations Audit Task',
    status: ExecutionTaskStatus.CREATED
  });

  ExecutionTaskRegistry.register(task);

  const initialUpdatedAt = task.updatedAt;

  // Small delay to verify timestamp update
  await new Promise((r) => setTimeout(r, 10));

  // Assign Employee
  const assigned = ExecutionTaskRegistry.assignEmployee('TASK-ASSIGN-01', 'EMP-AIOS-BOT');
  assert(assigned.assignedEmployeeId === 'EMP-AIOS-BOT', 'Employee ID should be updated');
  assert(assigned.status === ExecutionTaskStatus.ASSIGNED, 'Status should transition to ASSIGNED');
  assert(assigned.updatedAt >= initialUpdatedAt, 'updatedAt should be refreshed');

  // Update Status to RUNNING
  const running = ExecutionTaskRegistry.updateStatus('TASK-ASSIGN-01', ExecutionTaskStatus.RUNNING, { step: 'step-1' });
  assert(running.status === ExecutionTaskStatus.RUNNING, 'Status should be RUNNING');
  assert(running.metadata?.step === 'step-1', 'Metadata should be merged');

  console.log('   ✓ Task Assignment & Status Updates: PASSED');
}

async function testSnapshotAndImmutability() {
  console.log('[Test] Snapshot & Immutability starting...');

  ExecutionTaskRegistry.clear();

  const t1 = ExecutionTaskFactory.createTask({ title: 'Task 1', status: ExecutionTaskStatus.COMPLETED });
  const t2 = ExecutionTaskFactory.createTask({ title: 'Task 2', status: ExecutionTaskStatus.BLOCKED });

  ExecutionTaskRegistry.registerMany([t1, t2]);

  const snapshot = ExecutionTaskRegistry.captureSnapshot();
  assert(snapshot.totalTasksCount === 2, 'Snapshot task count mismatch');
  assert(snapshot.statusCounts[ExecutionTaskStatus.COMPLETED] === 1, 'Snapshot COMPLETED count mismatch');
  assert(snapshot.statusCounts[ExecutionTaskStatus.BLOCKED] === 1, 'Snapshot BLOCKED count mismatch');

  const history = ExecutionTaskRegistry.getSnapshotHistory();
  assert(history.length === 1, 'Snapshot history length should be 1');
  assert(ExecutionTaskRegistry.getLatestSnapshot()?.snapshotId === snapshot.snapshotId, 'Latest snapshot mismatch');

  // Immutability check
  const allTasks = ExecutionTaskRegistry.getAll();
  let mutated = false;
  try {
    (allTasks as any).push(t1);
  } catch (err) {
    mutated = true;
  }
  assert(mutated || allTasks.length === 2, 'getAll() array must be frozen');

  console.log('   ✓ Snapshot & Immutability: PASSED');
}

async function runAll() {
  console.log('--- Starting Execution Task Registry Unit Tests ---');
  await testTaskRegistrationAndDuplicatePrevention();
  await testTaskQueryingAndFiltering();
  await testTaskAssignmentAndStatusUpdates();
  await testSnapshotAndImmutability();
  console.log('--- All Execution Task Registry Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
