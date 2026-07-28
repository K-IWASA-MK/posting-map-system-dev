/**
 * test_task_lifecycle_foundation.ts
 * 
 * AIOS Task Lifecycle Foundation Unit Test Suite
 * Validates State Machine Transitions, Outcome Separation, Immutability, lifecycleId,
 * and Strict Determinism.
 */

import { TaskGateway } from '../../../sdk/gateway';
import { TaskDispatcher } from '../../../sdk/dispatcher';
import {
  TaskLifecycle,
  LifecycleValidator,
  TransitionRules,
  TaskState,
  TaskOutcome
} from '../../../sdk/lifecycle';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testValidStateTransitionFlow() {
  console.log('[Test 1] Valid State Transition Flow Verification...');

  const timestamp = '2026-07-29T10:00:00.000Z';
  const contract = TaskGateway.processCEODecision({
    ceoInput: 'タスクライフサイクルの状態遷移フローをテスト',
    timestamp
  }).contract;

  const assignment = TaskDispatcher.dispatch(contract, timestamp);

  // 1. Initial State: ASSIGNED
  let lc = TaskLifecycle.createInitialLifecycle(assignment, timestamp);
  assert(lc.currentState === 'ASSIGNED', `Initial state should be ASSIGNED, got ${lc.currentState}`);
  assert(lc.previousState === 'RECEIVED', 'Previous state should be RECEIVED');
  assert(lc.outcome === 'PENDING', 'Initial outcome should be PENDING');
  assert(lc.lifecycleId.startsWith('LC-'), 'lifecycleId must start with LC-');

  // 2. Step 2: ASSIGNED -> READY
  lc = TaskLifecycle.transition(lc, 'READY', 'PENDING', 'PREPARATION_COMPLETE', timestamp);
  assert(lc.currentState === 'READY', 'State should be READY');
  assert(lc.previousState === 'ASSIGNED', 'Previous state should be ASSIGNED');

  // 3. Step 3: READY -> IN_PROGRESS
  lc = TaskLifecycle.transition(lc, 'IN_PROGRESS', 'PENDING', 'WORK_STARTED', timestamp);
  assert(lc.currentState === 'IN_PROGRESS', 'State should be IN_PROGRESS');

  // 4. Step 4: IN_PROGRESS -> IMPLEMENTATION_DONE
  lc = TaskLifecycle.transition(lc, 'IMPLEMENTATION_DONE', 'PENDING', 'STAGE_COMPLETED', timestamp);
  assert(lc.currentState === 'IMPLEMENTATION_DONE', 'State should be IMPLEMENTATION_DONE');

  // 5. Step 5: IMPLEMENTATION_DONE -> UNDER_REVIEW
  lc = TaskLifecycle.transition(lc, 'UNDER_REVIEW', 'PENDING', 'STAGE_COMPLETED', timestamp);
  assert(lc.currentState === 'UNDER_REVIEW', 'State should be UNDER_REVIEW');

  // 6. Step 6: UNDER_REVIEW -> VERIFIED
  lc = TaskLifecycle.transition(lc, 'VERIFIED', 'PENDING', 'VALIDATION_PASSED', timestamp);
  assert(lc.currentState === 'VERIFIED', 'State should be VERIFIED');

  // 7. Step 7: VERIFIED -> HANDOVER_READY
  lc = TaskLifecycle.transition(lc, 'HANDOVER_READY', 'PENDING', 'HANDOVER_PREPARED', timestamp);
  assert(lc.currentState === 'HANDOVER_READY', 'State should be HANDOVER_READY');

  // 8. Step 8: HANDOVER_READY -> COMPLETED (with SUCCESS outcome)
  lc = TaskLifecycle.transition(lc, 'COMPLETED', 'SUCCESS', 'WORKFLOW_COMPLETED', timestamp);
  assert(lc.currentState === 'COMPLETED', 'State should be COMPLETED');
  assert(lc.outcome === 'SUCCESS', 'Outcome should be SUCCESS');

  // 9. Step 9: COMPLETED -> CLOSED
  lc = TaskLifecycle.transition(lc, 'CLOSED', 'SUCCESS', 'WORKFLOW_CLOSED', timestamp);
  assert(lc.currentState === 'CLOSED', 'State should be CLOSED');

  console.log('   ✓ Valid State Transition Flow Verification: PASSED');
}

async function testInvalidStateTransitionRejection() {
  console.log('[Test 2] Invalid State Transition Rejection Verification...');

  const timestamp = '2026-07-29T10:00:00.000Z';
  const contract = TaskGateway.processCEODecision({
    ceoInput: '不正状態遷移テスト',
    timestamp
  }).contract;

  const assignment = TaskDispatcher.dispatch(contract, timestamp);
  const lc = TaskLifecycle.createInitialLifecycle(assignment, timestamp); // ASSIGNED

  // Try illegal jump: ASSIGNED -> COMPLETED
  let rejected = false;
  try {
    TaskLifecycle.transition(lc, 'COMPLETED', 'SUCCESS', 'WORKFLOW_COMPLETED', timestamp);
  } catch (err: any) {
    rejected = true;
    assert(err.message.includes('Illegal TaskState transition'), 'Error message should explain state rejection');
  }
  assert(rejected, 'Illegal jump transition must be rejected');

  console.log('   ✓ Invalid State Transition Rejection Verification: PASSED');
}

async function testOutcomeStateMachineRules() {
  console.log('[Test 3] Outcome State Machine Rules Verification...');

  const timestamp = '2026-07-29T10:00:00.000Z';
  const contract = TaskGateway.processCEODecision({
    ceoInput: 'Outcome状態遷移マトリクステスト',
    timestamp
  }).contract;

  const assignment = TaskDispatcher.dispatch(contract, timestamp);
  let lc = TaskLifecycle.createInitialLifecycle(assignment, timestamp); // ASSIGNED, PENDING

  // PENDING -> SUCCESS is valid on state transition
  lc = TaskLifecycle.transition(lc, 'READY', 'PENDING', 'PREPARATION_COMPLETE', timestamp);
  lc = TaskLifecycle.transition(lc, 'CLOSED', 'SUCCESS', 'WORKFLOW_CLOSED', timestamp);
  assert(lc.outcome === 'SUCCESS', 'Outcome should transition to SUCCESS');

  // Reverting terminal outcome SUCCESS -> PENDING must be rejected
  let outcomeReversionRejected = false;
  try {
    TaskLifecycle.transition(lc, 'CLOSED', 'PENDING', 'WORKFLOW_CLOSED', timestamp);
  } catch (err: any) {
    outcomeReversionRejected = true;
    assert(err.message.includes('Illegal TaskOutcome transition'), 'Error message should explain outcome rejection');
  }
  assert(outcomeReversionRejected, 'Terminal outcome reversion to PENDING must be rejected');

  console.log('   ✓ Outcome State Machine Rules Verification: PASSED');
}

async function testStateAndOutcomeSeparation() {
  console.log('[Test 4] State & Outcome Separation Verification...');

  const timestamp = '2026-07-29T10:00:00.000Z';
  const contract = TaskGateway.processCEODecision({
    ceoInput: 'StateとOutcomeの分離テスト',
    timestamp
  }).contract;

  const assignment = TaskDispatcher.dispatch(contract, timestamp);
  
  // Successful completion
  let lcSuccess = TaskLifecycle.createInitialLifecycle(assignment, timestamp);
  lcSuccess = TaskLifecycle.transition(lcSuccess, 'READY', 'PENDING', 'PREPARATION_COMPLETE', timestamp);
  lcSuccess = TaskLifecycle.transition(lcSuccess, 'CLOSED', 'SUCCESS', 'WORKFLOW_CLOSED', timestamp);
  assert(lcSuccess.currentState === 'CLOSED', 'State should be CLOSED');
  assert(lcSuccess.outcome === 'SUCCESS', 'Outcome should be SUCCESS');

  // Failed completion
  let lcFailed = TaskLifecycle.createInitialLifecycle(assignment, timestamp);
  lcFailed = TaskLifecycle.transition(lcFailed, 'READY', 'PENDING', 'PREPARATION_COMPLETE', timestamp);
  lcFailed = TaskLifecycle.transition(lcFailed, 'CLOSED', 'FAILED', 'STAGE_FAILED', timestamp);
  assert(lcFailed.currentState === 'CLOSED', 'State should be CLOSED');
  assert(lcFailed.outcome === 'FAILED', 'Outcome should be FAILED');

  console.log('   ✓ State & Outcome Separation Verification: PASSED');
}

async function testImmutabilityAndLifecycleId() {
  console.log('[Test 5] Immutability & lifecycleId Verification...');

  const timestamp = '2026-07-29T10:00:00.000Z';
  const contract = TaskGateway.processCEODecision({
    ceoInput: '不変性とlifecycleIdの検証',
    timestamp
  }).contract;

  const assignment = TaskDispatcher.dispatch(contract, timestamp);
  const lc = TaskLifecycle.createInitialLifecycle(assignment, timestamp);

  assert(typeof lc.lifecycleId === 'string' && lc.lifecycleId.length > 5, 'lifecycleId must be non-empty string');
  assert(Object.isFrozen(lc), 'LifecycleRecord must be frozen');

  let mutationPrevented = false;
  try {
    (lc as any).currentState = 'COMPLETED';
  } catch {
    mutationPrevented = true;
  }
  assert(lc.currentState === 'ASSIGNED', 'Property mutation must be prevented on frozen LifecycleRecord');

  console.log('   ✓ Immutability & lifecycleId Verification: PASSED');
}

async function testStrictDeterminismAndSideEffectFree() {
  console.log('[Test 6] Strict Determinism & Side-Effect Free Verification...');

  const timestamp = '2026-07-29T10:00:00.000Z';
  const contract = TaskGateway.processCEODecision({
    ceoInput: '決定論的Lifecycle検証',
    timestamp
  }).contract;

  const assignment = TaskDispatcher.dispatch(contract, timestamp);

  const lc1 = TaskLifecycle.createInitialLifecycle(assignment, timestamp);
  const lc2 = TaskLifecycle.createInitialLifecycle(assignment, timestamp);

  assert(lc1.lifecycleId === lc2.lifecycleId, 'lifecycleId must be identical across calls');
  assert(
    JSON.stringify(lc1) === JSON.stringify(lc2),
    'Complete serialized LifecycleRecord JSON must match identically for deterministic inputs'
  );

  const trans1 = TaskLifecycle.transition(lc1, 'READY', 'PENDING', 'PREPARATION_COMPLETE', timestamp);
  const trans2 = TaskLifecycle.transition(lc2, 'READY', 'PENDING', 'PREPARATION_COMPLETE', timestamp);

  assert(
    JSON.stringify(trans1) === JSON.stringify(trans2),
    'Transitioned LifecycleRecords must match identically for deterministic inputs'
  );

  console.log('   ✓ Strict Determinism & Side-Effect Free Verification: PASSED');
}

async function runAll() {
  console.log('--- Starting Task Lifecycle Foundation Unit Tests ---');
  await testValidStateTransitionFlow();
  await testInvalidStateTransitionRejection();
  await testOutcomeStateMachineRules();
  await testStateAndOutcomeSeparation();
  await testImmutabilityAndLifecycleId();
  await testStrictDeterminismAndSideEffectFree();
  console.log('--- All Task Lifecycle Foundation Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
