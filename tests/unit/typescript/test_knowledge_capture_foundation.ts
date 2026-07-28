/**
 * test_knowledge_capture_foundation.ts
 * 
 * AIOS Knowledge Capture Foundation Unit Test Suite
 * Validates KnowledgeCandidate Extraction, Facts vs Inferences Separation,
 * Auditable Confidence Factors, Evidence ID References, Policy Enforcement, Immutability,
 * and Strict Determinism.
 */

import { TaskGateway } from '../../../sdk/gateway';
import { TaskDispatcher, AssignmentContract } from '../../../sdk/dispatcher';
import { TaskLifecycle, LifecycleRecord } from '../../../sdk/lifecycle';
import {
  KnowledgeCapture,
  CapturePolicyResolver,
  KnowledgeCandidate
} from '../../../sdk/knowledge';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

function createCompletedLifecycle(assignment: AssignmentContract, timestamp: string): LifecycleRecord {
  let lc = TaskLifecycle.createInitialLifecycle(assignment, timestamp);
  lc = TaskLifecycle.transition(lc, 'READY', 'PENDING', 'PREPARATION_COMPLETE', timestamp);
  lc = TaskLifecycle.transition(lc, 'IN_PROGRESS', 'PENDING', 'WORK_STARTED', timestamp);
  lc = TaskLifecycle.transition(lc, 'IMPLEMENTATION_DONE', 'PENDING', 'STAGE_COMPLETED', timestamp);
  lc = TaskLifecycle.transition(lc, 'UNDER_REVIEW', 'PENDING', 'STAGE_COMPLETED', timestamp);
  lc = TaskLifecycle.transition(lc, 'VERIFIED', 'PENDING', 'VALIDATION_PASSED', timestamp);
  lc = TaskLifecycle.transition(lc, 'HANDOVER_READY', 'PENDING', 'HANDOVER_PREPARED', timestamp);
  lc = TaskLifecycle.transition(lc, 'COMPLETED', 'SUCCESS', 'WORKFLOW_COMPLETED', timestamp);
  return lc;
}

async function testCompletedSuccessCandidateExtraction() {
  console.log('[Test 1] COMPLETED + SUCCESS Candidate Extraction Verification...');

  const timestamp = '2026-07-29T10:00:00.000Z';
  const contract = TaskGateway.processCEODecision({
    ceoInput: 'ナレッジキャプチャ基礎テスト機能の実装',
    timestamp
  }).contract;

  const assignment = TaskDispatcher.dispatch(contract, timestamp);
  const lc = createCompletedLifecycle(assignment, timestamp);

  const candidate = KnowledgeCapture.capture(lc, assignment, contract, undefined, timestamp);

  assert(candidate !== null, 'KnowledgeCandidate must be generated for COMPLETED + SUCCESS lifecycle');
  assert(candidate!.candidateId.startsWith('KC-'), 'candidateId must start with KC-');
  assert(candidate!.taskId === contract.taskId, 'taskId must match contract');
  assert(candidate!.lifecycleId === lc.lifecycleId, 'lifecycleId must match lifecycle');
  assert(candidate!.sourceAssignmentId === assignment.assignmentId, 'sourceAssignmentId must match assignment');

  console.log('   ✓ COMPLETED + SUCCESS Candidate Extraction Verification: PASSED');
}

async function testFactsAndInferencesSeparation() {
  console.log('[Test 2] Facts vs Inferences Separation Verification...');

  const timestamp = '2026-07-29T10:00:00.000Z';
  const contract = TaskGateway.processCEODecision({
    ceoInput: '事実と解釈の分離構造テスト',
    timestamp
  }).contract;

  const assignment = TaskDispatcher.dispatch(contract, timestamp);
  const lc = createCompletedLifecycle(assignment, timestamp);

  const candidate = KnowledgeCapture.capture(lc, assignment, contract, undefined, timestamp);
  assert(candidate !== null, 'Candidate must be generated');

  // Verify facts
  assert(Array.isArray(candidate?.facts), 'facts must be an array');
  assert(candidate!.facts.length > 0, 'facts array must be populated');
  assert(candidate!.facts.some(f => f.includes('Task ID:')), 'facts must include Task ID');
  assert(candidate!.facts.some(f => f.includes('Assigned Agent ID:')), 'facts must include Assigned Agent ID');

  // Verify inferences
  assert(Array.isArray(candidate?.inferences), 'inferences must be an array');
  assert(candidate!.inferences.length > 0, 'inferences array must be populated');
  assert(candidate!.inferences.some(i => i.includes('Pattern Classification:')), 'inferences must include Pattern Classification');

  console.log('   ✓ Facts vs Inferences Separation Verification: PASSED');
}

async function testAuditableConfidenceFactors() {
  console.log('[Test 3] Auditable Confidence Factors Verification...');

  const timestamp = '2026-07-29T10:00:00.000Z';
  const contract = TaskGateway.processCEODecision({
    ceoInput: '確証度根拠テスト',
    timestamp
  }).contract;

  const assignment = TaskDispatcher.dispatch(contract, timestamp);
  const lc = createCompletedLifecycle(assignment, timestamp);

  const candidate = KnowledgeCapture.capture(lc, assignment, contract, undefined, timestamp)!;

  assert(candidate.confidence === 1.0, `Expected confidence 1.0, got ${candidate.confidence}`);
  assert(Array.isArray(candidate.confidenceFactors), 'confidenceFactors must be an array');
  assert(candidate.confidenceFactors.includes('LIFECYCLE_COMPLETED_SUCCESS'), 'Must include LIFECYCLE_COMPLETED_SUCCESS factor');
  assert(candidate.confidenceFactors.includes('EXACT_ROLE_MATCH'), 'Must include EXACT_ROLE_MATCH factor');

  console.log('   ✓ Auditable Confidence Factors Verification: PASSED');
}

async function testEvidenceIdReferenceRestriction() {
  console.log('[Test 4] Evidence ID Reference Restriction Verification...');

  const timestamp = '2026-07-29T10:00:00.000Z';
  const contract = TaskGateway.processCEODecision({
    ceoInput: '証拠ID参照制限テスト',
    timestamp
  }).contract;

  const assignment = TaskDispatcher.dispatch(contract, timestamp);
  const lc = createCompletedLifecycle(assignment, timestamp);

  const candidate = KnowledgeCapture.capture(lc, assignment, contract, undefined, timestamp)!;

  assert(Array.isArray(candidate.evidenceReferences), 'evidenceReferences must be an array');
  assert(candidate.evidenceReferences.length === 3, 'evidenceReferences should contain 3 IDs');
  assert(candidate.evidenceReferences.includes(contract.taskId), 'Must include contract taskId');
  assert(candidate.evidenceReferences.includes(assignment.assignmentId), 'Must include assignmentId');
  assert(candidate.evidenceReferences.includes(lc.lifecycleId), 'Must include lifecycleId');

  console.log('   ✓ Evidence ID Reference Restriction Verification: PASSED');
}

async function testFailedAndNonCompletedRejection() {
  console.log('[Test 5] FAILED & Non-COMPLETED Rejection Verification...');

  const timestamp = '2026-07-29T10:00:00.000Z';
  const contract = TaskGateway.processCEODecision({
    ceoInput: '失敗件数却下テスト',
    timestamp
  }).contract;

  const assignment = TaskDispatcher.dispatch(contract, timestamp);

  // 1. In Progress (not COMPLETED)
  let lcRunning = TaskLifecycle.createInitialLifecycle(assignment, timestamp);
  lcRunning = TaskLifecycle.transition(lcRunning, 'READY', 'PENDING', 'PREPARATION_COMPLETE', timestamp);
  const candRunning = KnowledgeCapture.capture(lcRunning, assignment, contract, undefined, timestamp);
  assert(candRunning === null, 'Candidate must be null for non-COMPLETED state');

  // 2. COMPLETED with FAILED outcome
  let lcFailed = TaskLifecycle.createInitialLifecycle(assignment, timestamp);
  lcFailed = TaskLifecycle.transition(lcFailed, 'READY', 'PENDING', 'PREPARATION_COMPLETE', timestamp);
  lcFailed = TaskLifecycle.transition(lcFailed, 'CLOSED', 'FAILED', 'STAGE_FAILED', timestamp);
  const candFailed = KnowledgeCapture.capture(lcFailed, assignment, contract, undefined, timestamp);
  assert(candFailed === null, 'Candidate must be null for FAILED outcome');

  console.log('   ✓ FAILED & Non-COMPLETED Rejection Verification: PASSED');
}

async function testPolicyDisabledRejection() {
  console.log('[Test 6] Policy Disabled Rejection Verification...');

  const timestamp = '2026-07-29T10:00:00.000Z';
  const contract = TaskGateway.processCEODecision({
    ceoInput: 'ポリシー無効判定テスト',
    timestamp
  }).contract;

  const assignment = TaskDispatcher.dispatch(contract, timestamp);
  const lc = createCompletedLifecycle(assignment, timestamp);

  const disabledPolicy = Object.freeze({
    ...CapturePolicyResolver.getDefaultPolicy(),
    enabled: false
  });

  const candidate = KnowledgeCapture.capture(lc, assignment, contract, disabledPolicy, timestamp);
  assert(candidate === null, 'Candidate must be null when CapturePolicy is disabled');

  console.log('   ✓ Policy Disabled Rejection Verification: PASSED');
}

async function testImmutabilityAndStrictDeterminism() {
  console.log('[Test 7] Immutability & Strict Determinism Verification...');

  const timestamp = '2026-07-29T10:00:00.000Z';
  const contract = TaskGateway.processCEODecision({
    ceoInput: '不変性と決定論の検証',
    timestamp
  }).contract;

  const assignment = TaskDispatcher.dispatch(contract, timestamp);
  const lc = createCompletedLifecycle(assignment, timestamp);

  const candA = KnowledgeCapture.capture(lc, assignment, contract, undefined, timestamp)!;
  const candB = KnowledgeCapture.capture(lc, assignment, contract, undefined, timestamp)!;

  assert(Object.isFrozen(candA), 'KnowledgeCandidate must be frozen');
  assert(Object.isFrozen(candA.facts), 'facts must be frozen');
  assert(Object.isFrozen(candA.inferences), 'inferences must be frozen');
  assert(Object.isFrozen(candA.confidenceFactors), 'confidenceFactors must be frozen');
  assert(Object.isFrozen(candA.evidenceReferences), 'evidenceReferences must be frozen');

  assert(candA.candidateId === candB.candidateId, 'candidateId must be identical');
  assert(
    JSON.stringify(candA) === JSON.stringify(candB),
    'Complete serialized KnowledgeCandidate JSON must match identically for deterministic inputs'
  );

  console.log('   ✓ Immutability & Strict Determinism Verification: PASSED');
}

async function runAll() {
  console.log('--- Starting Knowledge Capture Foundation Unit Tests ---');
  await testCompletedSuccessCandidateExtraction();
  await testFactsAndInferencesSeparation();
  await testAuditableConfidenceFactors();
  await testEvidenceIdReferenceRestriction();
  await testFailedAndNonCompletedRejection();
  await testPolicyDisabledRejection();
  await testImmutabilityAndStrictDeterminism();
  console.log('--- All Knowledge Capture Foundation Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
