/**
 * test_skill_learning_foundation.ts
 * 
 * AIOS Skill Learning Foundation Unit Test Suite
 * Validates SkillEvidence Evaluation, SkillCandidate Generation, Proficiency Mapping,
 * Auditable LearningFactors, Policy Enforcement, Immutability, and Strict Determinism.
 */

import { TaskGateway } from '../../../sdk/gateway';
import { TaskDispatcher, AssignmentContract } from '../../../sdk/dispatcher';
import { TaskLifecycle, LifecycleRecord } from '../../../sdk/lifecycle';
import { KnowledgeCapture, KnowledgeCandidate } from '../../../sdk/knowledge';
import {
  SkillLearning,
  LearningPolicyResolver,
  ProficiencyMapper,
  SkillEvidence,
  SkillCandidate
} from '../../../sdk/learning';

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

async function testHighConfidenceCandidateLearning() {
  console.log('[Test 1] High Confidence Candidate Learning Verification...');

  const timestamp = '2026-07-29T10:00:00.000Z';
  const contract = TaskGateway.processCEODecision({
    ceoInput: 'スキル学習基礎機能の実装とテスト',
    timestamp
  }).contract;

  const assignment = TaskDispatcher.dispatch(contract, timestamp);
  const lc = createCompletedLifecycle(assignment, timestamp);
  const kc = KnowledgeCapture.capture(lc, assignment, contract, undefined, timestamp)!;

  const evidence = SkillLearning.evaluateEvidence(kc, undefined, timestamp);
  assert(evidence !== null, 'SkillEvidence must be generated');
  assert(evidence!.skillEvidenceId.startsWith('SE-'), 'skillEvidenceId must start with SE-');
  assert(evidence!.knowledgeCandidateId === kc.candidateId, 'knowledgeCandidateId must match');

  const skillCandidate = SkillLearning.learn(kc, undefined, timestamp);
  assert(skillCandidate !== null, 'SkillCandidate must be generated');
  assert(skillCandidate!.skillCandidateId.startsWith('SKC-'), 'skillCandidateId must start with SKC-');
  assert(skillCandidate!.sourceEvidenceId === evidence!.skillEvidenceId, 'sourceEvidenceId must match evidenceId');

  console.log('   ✓ High Confidence Candidate Learning Verification: PASSED');
}

async function testProficiencyMapperAndLearningFactors() {
  console.log('[Test 2] ProficiencyMapper & LearningFactors Verification...');

  assert(ProficiencyMapper.mapScoreToLevel(100.0) === 'MASTER', '100 score must map to MASTER');
  assert(ProficiencyMapper.mapScoreToLevel(80.0) === 'EXPERT', '80 score must map to EXPERT');
  assert(ProficiencyMapper.mapScoreToLevel(60.0) === 'PROFICIENT', '60 score must map to PROFICIENT');
  assert(ProficiencyMapper.mapScoreToLevel(30.0) === 'COMPETENT', '30 score must map to COMPETENT');
  assert(ProficiencyMapper.mapScoreToLevel(10.0) === 'NOVICE', '10 score must map to NOVICE');

  const timestamp = '2026-07-29T10:00:00.000Z';
  const contract = TaskGateway.processCEODecision({
    ceoInput: '習熟度マッピングテスト',
    timestamp
  }).contract;

  const assignment = TaskDispatcher.dispatch(contract, timestamp);
  const lc = createCompletedLifecycle(assignment, timestamp);
  const kc = KnowledgeCapture.capture(lc, assignment, contract, undefined, timestamp)!;

  const skillCandidate = SkillLearning.learn(kc, undefined, timestamp)!;
  assert(skillCandidate.proficiencyLevel === 'MASTER', 'Confidence 1.0 (100%) must result in MASTER level');
  assert(Array.isArray(skillCandidate.learningFactors), 'learningFactors must be an array');
  assert(skillCandidate.learningFactors.includes('HIGH_CONFIDENCE_INPUT'), 'Must include HIGH_CONFIDENCE_INPUT factor');
  assert(skillCandidate.learningFactors.includes('DETERMINISTIC_MAPPER_APPLIED'), 'Must include DETERMINISTIC_MAPPER_APPLIED factor');

  console.log('   ✓ ProficiencyMapper & LearningFactors Verification: PASSED');
}

async function testLowConfidenceRejection() {
  console.log('[Test 3] Low Confidence Rejection Verification...');

  const timestamp = '2026-07-29T10:00:00.000Z';
  const contract = TaskGateway.processCEODecision({
    ceoInput: '低信頼度却下テスト',
    timestamp
  }).contract;

  const assignment = TaskDispatcher.dispatch(contract, timestamp);
  const lc = createCompletedLifecycle(assignment, timestamp);
  const kcValid = KnowledgeCapture.capture(lc, assignment, contract, undefined, timestamp)!;

  // Create a low confidence mock KnowledgeCandidate (confidence 0.5 < minimumConfidence 0.8)
  const kcLowConfidence: KnowledgeCandidate = Object.freeze({
    ...kcValid,
    confidence: 0.5
  });

  const skillCandidate = SkillLearning.learn(kcLowConfidence, undefined, timestamp);
  assert(skillCandidate === null, 'SkillCandidate must be null for confidence < 0.8');

  console.log('   ✓ Low Confidence Rejection Verification: PASSED');
}

async function testPolicyDisabledRejection() {
  console.log('[Test 4] Policy Disabled Rejection Verification...');

  const timestamp = '2026-07-29T10:00:00.000Z';
  const contract = TaskGateway.processCEODecision({
    ceoInput: 'ポリシー無効化テスト',
    timestamp
  }).contract;

  const assignment = TaskDispatcher.dispatch(contract, timestamp);
  const lc = createCompletedLifecycle(assignment, timestamp);
  const kc = KnowledgeCapture.capture(lc, assignment, contract, undefined, timestamp)!;

  const disabledPolicy = Object.freeze({
    ...LearningPolicyResolver.getDefaultPolicy(),
    enabled: false
  });

  const skillCandidate = SkillLearning.learn(kc, disabledPolicy, timestamp);
  assert(skillCandidate === null, 'SkillCandidate must be null when LearningPolicy is disabled');

  console.log('   ✓ Policy Disabled Rejection Verification: PASSED');
}

async function testEvidenceAndCandidateLinkage() {
  console.log('[Test 5] SkillCandidate & SkillEvidence ID Linkage Verification...');

  const timestamp = '2026-07-29T10:00:00.000Z';
  const contract = TaskGateway.processCEODecision({
    ceoInput: 'ID紐付け構造テスト',
    timestamp
  }).contract;

  const assignment = TaskDispatcher.dispatch(contract, timestamp);
  const lc = createCompletedLifecycle(assignment, timestamp);
  const kc = KnowledgeCapture.capture(lc, assignment, contract, undefined, timestamp)!;

  const evidence = SkillLearning.evaluateEvidence(kc, undefined, timestamp)!;
  const skillCandidate = SkillLearning.learn(kc, undefined, timestamp)!;

  assert(evidence.knowledgeCandidateId === kc.candidateId, 'SkillEvidence must link to KnowledgeCandidate');
  assert(skillCandidate.sourceEvidenceId === evidence.skillEvidenceId, 'SkillCandidate must link to SkillEvidence');

  console.log('   ✓ SkillCandidate & SkillEvidence ID Linkage Verification: PASSED');
}

async function testImmutabilityAndStrictDeterminism() {
  console.log('[Test 6] Immutability & Strict Determinism Verification...');

  const timestamp = '2026-07-29T10:00:00.000Z';
  const contract = TaskGateway.processCEODecision({
    ceoInput: '不変性と決定論の検証',
    timestamp
  }).contract;

  const assignment = TaskDispatcher.dispatch(contract, timestamp);
  const lc = createCompletedLifecycle(assignment, timestamp);
  const kc = KnowledgeCapture.capture(lc, assignment, contract, undefined, timestamp)!;

  const scA = SkillLearning.learn(kc, undefined, timestamp)!;
  const scB = SkillLearning.learn(kc, undefined, timestamp)!;

  assert(Object.isFrozen(scA), 'SkillCandidate must be frozen');
  assert(Object.isFrozen(scA.learningFactors), 'learningFactors must be frozen');

  assert(scA.skillCandidateId === scB.skillCandidateId, 'skillCandidateId must be identical');
  assert(
    JSON.stringify(scA) === JSON.stringify(scB),
    'Complete serialized SkillCandidate JSON must match identically for deterministic inputs'
  );

  console.log('   ✓ Immutability & Strict Determinism Verification: PASSED');
}

async function runAll() {
  console.log('--- Starting Skill Learning Foundation Unit Tests ---');
  await testHighConfidenceCandidateLearning();
  await testProficiencyMapperAndLearningFactors();
  await testLowConfidenceRejection();
  await testPolicyDisabledRejection();
  await testEvidenceAndCandidateLinkage();
  await testImmutabilityAndStrictDeterminism();
  console.log('--- All Skill Learning Foundation Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
