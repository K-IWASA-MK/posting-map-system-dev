/**
 * test_task_gateway_workflow_profile.ts
 * 
 * AIOS Task Gateway Workflow Profile Extension (v1.1) Unit Test Suite
 * Validates WorkflowProfile Generation, Default Workflow Mapping, Stage Sequences,
 * OutputPolicy, CompletionPolicy, Immutability, and Determinism.
 */

import { TaskGateway, WorkflowProfile, WorkflowStage } from '../../../sdk/gateway';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testWorkflowProfileGeneration() {
  console.log('[Test 1] WorkflowProfile Generation Verification...');

  const timestamp = '2026-07-29T12:00:00.000Z';
  const result = TaskGateway.processCEODecision({
    ceoInput: '新機能のコード実装と開発を実施',
    timestamp
  });

  const contract = result.contract;
  assert(contract.workflowProfile !== undefined, 'TaskContract must contain workflowProfile');
  assert(contract.workflowProfile.workflowType === 'STANDARD_DEVELOPMENT', 'workflowType should be STANDARD_DEVELOPMENT');

  console.log('   ✓ WorkflowProfile Generation Verification: PASSED');
}

async function testDefaultWorkflowMapping() {
  console.log('[Test 2] Default Workflow Mapping Verification...');

  const timestamp = '2026-07-29T12:00:00.000Z';
  const result = TaskGateway.processCEODecision({
    ceoInput: 'バグの修正とコードのデプロイを実施',
    timestamp
  });

  const profile: WorkflowProfile = result.contract.workflowProfile;
  assert(profile.workflowType === 'STANDARD_DEVELOPMENT', 'Default mapping for IMPLEMENTATION intent must be STANDARD_DEVELOPMENT');

  console.log('   ✓ Default Workflow Mapping Verification: PASSED');
}

async function testWorkflowStageOrder() {
  console.log('[Test 3] WorkflowStage Order Verification...');

  const timestamp = '2026-07-29T12:00:00.000Z';
  const result = TaskGateway.processCEODecision({
    ceoInput: '開発フローのステージシーケンスを検証',
    timestamp
  });

  const stages = result.contract.workflowProfile.stages;
  assert(Array.isArray(stages), 'stages must be an array');

  const expectedStages: WorkflowStage[] = [
    'PLAN',
    'REVIEW',
    'PROCEED',
    'IMPLEMENTATION',
    'VERIFICATION',
    'GIT_COMMIT',
    'GIT_PUSH',
    'WALKTHROUGH',
    'HANDOVER',
    'CLOSE'
  ];

  assert(stages.length === expectedStages.length, `Expected ${expectedStages.length} stages, got ${stages.length}`);
  for (let i = 0; i < expectedStages.length; i++) {
    assert(stages[i] === expectedStages[i], `Stage index ${i} expected ${expectedStages[i]}, got ${stages[i]}`);
  }

  console.log('   ✓ WorkflowStage Order Verification: PASSED');
}

async function testOutputPolicyRetention() {
  console.log('[Test 4] OutputPolicy Retention Verification...');

  const timestamp = '2026-07-29T12:00:00.000Z';
  const result = TaskGateway.processCEODecision({
    ceoInput: '言語ポリシー設定の確認',
    timestamp
  });

  const outputPolicy = result.contract.workflowProfile.outputPolicy;
  assert(outputPolicy.language === 'ja', 'Language must be ja');
  assert(outputPolicy.codeLanguage === 'en', 'Code language must be en');
  assert(outputPolicy.documentationLanguage === 'ja', 'Documentation language must be ja');

  console.log('   ✓ OutputPolicy Retention Verification: PASSED');
}

async function testCompletionPolicyRetention() {
  console.log('[Test 5] CompletionPolicy Retention Verification...');

  const timestamp = '2026-07-29T12:00:00.000Z';
  const result = TaskGateway.processCEODecision({
    ceoInput: '完了必須ポリシー設定の確認',
    timestamp
  });

  const completionPolicy = result.contract.workflowProfile.completionPolicy;
  assert(completionPolicy.requireVerification === true, 'requireVerification must be true');
  assert(completionPolicy.requireGitCommit === true, 'requireGitCommit must be true');
  assert(completionPolicy.requireGitPush === true, 'requireGitPush must be true');
  assert(completionPolicy.requireWalkthrough === true, 'requireWalkthrough must be true');
  assert(completionPolicy.requireHandover === true, 'requireHandover must be true');

  console.log('   ✓ CompletionPolicy Retention Verification: PASSED');
}

async function testImmutabilityAndDeterminism() {
  console.log('[Test 6] Immutability & Determinism Verification...');

  const timestamp = '2026-07-29T12:00:00.000Z';
  const resA = TaskGateway.processCEODecision({
    ceoInput: '不変性と決定論の検証',
    timestamp
  });
  const resB = TaskGateway.processCEODecision({
    ceoInput: '不変性と決定論の検証',
    timestamp
  });

  const profileA = resA.contract.workflowProfile;
  const profileB = resB.contract.workflowProfile;

  assert(Object.isFrozen(profileA), 'WorkflowProfile must be frozen');
  assert(Object.isFrozen(profileA.stages), 'stages must be frozen');
  assert(Object.isFrozen(profileA.outputPolicy), 'outputPolicy must be frozen');
  assert(Object.isFrozen(profileA.completionPolicy), 'completionPolicy must be frozen');

  assert(
    JSON.stringify(profileA) === JSON.stringify(profileB),
    'Serialized WorkflowProfile JSON must match identically for deterministic inputs'
  );

  console.log('   ✓ Immutability & Determinism Verification: PASSED');
}

async function runAll() {
  console.log('--- Starting Task Gateway Workflow Profile (v1.1) Unit Tests ---');
  await testWorkflowProfileGeneration();
  await testDefaultWorkflowMapping();
  await testWorkflowStageOrder();
  await testOutputPolicyRetention();
  await testCompletionPolicyRetention();
  await testImmutabilityAndDeterminism();
  console.log('--- All Task Gateway Workflow Profile Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
