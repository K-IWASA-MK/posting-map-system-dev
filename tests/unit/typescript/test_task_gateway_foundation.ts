/**
 * test_task_gateway_foundation.ts
 * 
 * AIOS Task Gateway Foundation Unit Test Suite
 * Validates AIOS First Principle, Intent Classification, Workflow Stages Pipeline,
 * Output Policy, Immutability, and Strict Determinism.
 */

import {
  TaskGateway,
  CEODecisionInput,
  TaskIntent,
  WorkflowSelector,
  OutputPolicyResolver,
  IntentClassifier
} from '../../../sdk/gateway';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testFirstPrincipleAndSingleIntake() {
  console.log('[Test 1] AIOS First Principle & Single Intake Verification...');

  assert(
    typeof TaskGateway.FIRST_PRINCIPLE === 'string',
    'FIRST_PRINCIPLE must be defined as a string constant'
  );
  assert(
    TaskGateway.FIRST_PRINCIPLE.includes('Antigravity IDE上のすべての業務指示は'),
    'FIRST_PRINCIPLE must contain constitutional single intake statement'
  );
  assert(
    TaskGateway.FIRST_PRINCIPLE.includes('Task Gatewayのみが正式なTask Contractを生成できる'),
    'FIRST_PRINCIPLE must state Task Gateway is sole generator of Task Contract'
  );

  console.log('   ✓ AIOS First Principle & Single Intake Verification: PASSED');
}

async function testIntentClassificationEightIntents() {
  console.log('[Test 2] CEO Decision Intake & 8-Intent Classification...');

  const timestamp = '2026-07-29T10:00:00.000Z';

  // 1. QUESTION
  const res1 = TaskGateway.processCEODecision({
    ceoInput: 'このアーキテクチャについて質問があります。仕組を教えて',
    timestamp
  });
  assert(res1.contract.intent === 'QUESTION', `Expected QUESTION intent, got ${res1.contract.intent}`);

  // 2. PLANNING
  const res2 = TaskGateway.processCEODecision({
    ceoInput: 'Sprint G10のロードマップと計画書を作成してください',
    timestamp
  });
  assert(res2.contract.intent === 'PLANNING', `Expected PLANNING intent, got ${res2.contract.intent}`);

  // 3. DESIGN
  const res3 = TaskGateway.processCEODecision({
    ceoInput: 'Task Gateway Foundationのモジュール設計とアーキテクチャ',
    timestamp
  });
  assert(res3.contract.intent === 'DESIGN', `Expected DESIGN intent, got ${res3.contract.intent}`);

  // 4. IMPLEMENTATION
  const res4 = TaskGateway.processCEODecision({
    ceoInput: '新規のTask Gateway Foundation機能を実装してください',
    timestamp
  });
  assert(res4.contract.intent === 'IMPLEMENTATION', `Expected IMPLEMENTATION intent, got ${res4.contract.intent}`);

  // 5. REVIEW
  const res5 = TaskGateway.processCEODecision({
    ceoInput: 'コードレビューを実施して査読結果を出力してください',
    timestamp
  });
  assert(res5.contract.intent === 'REVIEW', `Expected REVIEW intent, got ${res5.contract.intent}`);

  // 6. AUDIT
  const res6 = TaskGateway.processCEODecision({
    ceoInput: 'セキュリティ監査とコンプライアンス検証を実行',
    timestamp
  });
  assert(res6.contract.intent === 'AUDIT', `Expected AUDIT intent, got ${res6.contract.intent}`);

  // 7. RESEARCH
  const res7 = TaskGateway.processCEODecision({
    ceoInput: '競合ツールのリサーチとデータ調査を実施',
    timestamp
  });
  assert(res7.contract.intent === 'RESEARCH', `Expected RESEARCH intent, got ${res7.contract.intent}`);

  // 8. HOTFIX
  const res8 = TaskGateway.processCEODecision({
    ceoInput: '緊急のバグ修正と障害対応 hotfix',
    timestamp
  });
  assert(res8.contract.intent === 'HOTFIX', `Expected HOTFIX intent, got ${res8.contract.intent}`);

  // Invalid empty input rejection check
  let errorThrown = false;
  try {
    TaskGateway.processCEODecision({ ceoInput: '', timestamp });
  } catch (err: any) {
    errorThrown = true;
    assert(err.message.includes('non-empty string'), 'Error message should explain rejection');
  }
  assert(errorThrown, 'Empty CEO input must be rejected');

  console.log('   ✓ CEO Decision Intake & 8-Intent Classification: PASSED');
}

async function testWorkflowSelectionAndStagesPipeline() {
  console.log('[Test 3] Workflow Selection & Workflow Stages Pipeline...');

  const timestamp = '2026-07-29T10:00:00.000Z';
  const input: CEODecisionInput = {
    ceoInput: 'Task Gatewayの新規機能を構築・実装してください',
    timestamp
  };

  const result = TaskGateway.processCEODecision(input);
  const contract = result.contract;

  assert(contract.workflowProfile.workflowType === 'STANDARD_DEVELOPMENT', 'Profile should be STANDARD_DEVELOPMENT');
  assert(Array.isArray(contract.workflowStages), 'workflowStages must be an array');
  assert(contract.workflowStages.length > 0, 'workflowStages must contain stage steps');

  // Verify explicit stage pipeline sequence
  const expectedStages = [
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
  for (let i = 0; i < expectedStages.length; i++) {
    assert(
      contract.workflowStages[i] === expectedStages[i],
      `Stage index ${i} should be ${expectedStages[i]}, got ${contract.workflowStages[i]}`
    );
  }

  console.log('   ✓ Workflow Selection & Workflow Stages Pipeline: PASSED');
}

async function testTaskContractImmutability() {
  console.log('[Test 4] Task Contract Immutability Verification...');

  const timestamp = '2026-07-29T10:00:00.000Z';
  const input: CEODecisionInput = {
    ceoInput: 'Task Contract の不変性をテストしてください',
    timestamp,
    definitionOfDone: ['Immutability verified']
  };

  const result = TaskGateway.processCEODecision(input);
  const contract = result.contract;

  assert(Object.isFrozen(contract), 'TaskContract object must be frozen');
  assert(Object.isFrozen(contract.workflowStages), 'workflowStages array must be frozen');
  assert(Object.isFrozen(contract.outputPolicy), 'outputPolicy must be frozen');
  assert(Object.isFrozen(contract.definitionOfDone), 'definitionOfDone array must be frozen');
  assert(Object.isFrozen(contract.ceoDecision), 'ceoDecision provenance must be frozen');

  let mutationPrevented = false;
  try {
    (contract as any).status = 'RECEIVED';
  } catch {
    mutationPrevented = true;
  }
  // If not strict mode, property assignment won't update frozen object
  assert(contract.status === 'CONTRACT_GENERATED', 'Frozen object property should not be mutated');

  console.log('   ✓ Task Contract Immutability Verification: PASSED');
}

async function testOutputLanguagePolicy() {
  console.log('[Test 5] Output Language Policy Verification...');

  const timestamp = '2026-07-29T10:00:00.000Z';
  const result = TaskGateway.processCEODecision({
    ceoInput: '成果物の出力言語ポリシーを確認してください',
    timestamp
  });

  const contract = result.contract;
  assert(contract.outputLanguage === 'JA', 'outputLanguage must be JA');
  assert(contract.outputPolicy.primaryLanguage === 'JA', 'Primary language in policy must be JA');
  assert(contract.outputPolicy.allowEnglishTechnicalTerms === true, 'English technical terms must be allowed');
  assert(contract.outputPolicy.rules.length > 0, 'Policy rules must be populated');

  console.log('   ✓ Output Language Policy Verification: PASSED');
}

async function testDeterministicAndSideEffectFree() {
  console.log('[Test 6] Strict Deterministic & Side-Effect Free Verification...');

  const timestamp = '2026-07-29T12:34:56.789Z';
  const input: CEODecisionInput = {
    ceoInput: '同一入力に対する完全決定論的テスト',
    timestamp,
    requestedPriority: 'HIGH',
    metadata: { key: 'value' }
  };

  const resultA = TaskGateway.processCEODecision(input);
  const resultB = TaskGateway.processCEODecision(input);

  assert(resultA.contract.taskId === resultB.contract.taskId, 'Task ID must be identical across calls');
  assert(resultA.contract.createdAt === resultB.contract.createdAt, 'createdAt must be identical across calls');
  assert(resultA.contract.intent === resultB.contract.intent, 'Intent must be identical across calls');
  assert(resultA.contract.workflowProfile.workflowType === resultB.contract.workflowProfile.workflowType, 'Profile must be identical');
  assert(
    JSON.stringify(resultA.contract) === JSON.stringify(resultB.contract),
    'Complete TaskContract serialized JSON must match identically for deterministic inputs'
  );

  console.log('   ✓ Strict Deterministic & Side-Effect Free Verification: PASSED');
}

async function runAll() {
  console.log('--- Starting Task Gateway Foundation Unit Tests ---');
  await testFirstPrincipleAndSingleIntake();
  await testIntentClassificationEightIntents();
  await testWorkflowSelectionAndStagesPipeline();
  await testTaskContractImmutability();
  await testOutputLanguagePolicy();
  await testDeterministicAndSideEffectFree();
  console.log('--- All Task Gateway Foundation Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
