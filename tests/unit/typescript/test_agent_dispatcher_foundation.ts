/**
 * test_task_dispatcher_foundation.ts
 * 
 * AIOS Task Dispatcher Foundation Unit Test Suite
 * Validates Role Matching, Capability Matching, Reason Codes, Custom Registry Injection,
 * Immutability, and Strict Determinism.
 */

import { TaskGateway, CEODecisionInput } from '../../../sdk/gateway';
import { AgentDispatcher } from '../../../sdk/assignment/AgentDispatcher';
import { AgentRegistry } from '../../../sdk/assignment/domain/AgentRegistry';
import { AgentProfile, CapabilityType } from '../../../sdk/assignment/models/AgentModels';
import { CapabilityMatcher } from '../../../sdk/assignment/domain/CapabilityMatcher';
import { RoleResolver } from '../../../sdk/assignment/domain/RoleResolver';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testRoleMatchingAndResolution() {
  console.log('[Test 1] Role Matching & Resolution Verification...');

  const timestamp = '2026-07-29T12:00:00.000Z';
  const gatewayResult = TaskGateway.processCEODecision({
    ceoInput: 'システムアーキテクチャの設計とレビューを実施',
    timestamp
  });

  const role = RoleResolver.resolveRequiredRole(gatewayResult.contract);
  assert(role === 'REVIEW_ENGINEER' || role === 'ARCHITECTURE_DESIGNER' || role === 'IMPLEMENTATION_ENGINEER', `Unexpected resolved role: ${role}`);

  const defaultRegistry = AgentRegistry.createDefaultRegistry();
  const matchingAgents = defaultRegistry.findAgentsByRole('ARCHITECTURE_DESIGNER');
  assert(matchingAgents.length > 0, 'Matching agents for ARCHITECTURE_DESIGNER should exist');

  console.log('   ✓ Role Matching & Resolution Verification: PASSED');
}

async function testTypedCapabilityMatchScoringAndReasonCodes() {
  console.log('[Test 2] Typed Capability Match Scoring & Reason Codes...');

  const sampleAgent: AgentProfile = {
    agentId: 'AGENT-TEST-01',
    agentName: 'Test Specialist',
    provider: 'TestProvider',
    supportedRoles: ['IMPLEMENTATION_ENGINEER'],
    capabilities: ['TYPESCRIPT', 'TESTING', 'GIT'],
    priorityWeight: 1.0
  };

  const exactMatch = CapabilityMatcher.evaluateMatch(['TYPESCRIPT', 'TESTING'], sampleAgent);
  assert(exactMatch.matchScore === 100.0, `Expected 100% score, got ${exactMatch.matchScore}`);
  assert(exactMatch.reasonCode === 'EXACT_CAPABILITY_MATCH', `Expected EXACT_CAPABILITY_MATCH, got ${exactMatch.reasonCode}`);
  assert(exactMatch.matchedCapabilities.length === 2, 'Matched count should be 2');

  const partialMatch = CapabilityMatcher.evaluateMatch(['TYPESCRIPT', 'SECURITY'], sampleAgent);
  assert(partialMatch.matchScore === 50.0, `Expected 50% score, got ${partialMatch.matchScore}`);
  assert(partialMatch.reasonCode === 'PARTIAL_CAPABILITY_MATCH', `Expected PARTIAL_CAPABILITY_MATCH, got ${partialMatch.reasonCode}`);
  assert(partialMatch.matchedCapabilities.length === 1, 'Matched count should be 1');

  console.log('   ✓ Typed Capability Match Scoring & Reason Codes: PASSED');
}

async function testMultiAgentComparisonAndOptimalSelection() {
  console.log('[Test 3] Multi-Agent Comparison & Optimal Selection...');

  const timestamp = '2026-07-29T12:00:00.000Z';
  const taskContract = TaskGateway.processCEODecision({
    ceoInput: 'セキュリティ監査とログの検証を実施',
    timestamp
  }).contract;

  const defaultRegistry = AgentRegistry.createDefaultRegistry();
  const assignment = AgentDispatcher.dispatch(taskContract, timestamp, defaultRegistry);

  assert(assignment.taskId === taskContract.taskId, 'Assignment taskId must match contract');
  assert(assignment.selectedAgent !== undefined, 'Selected agent must be populated');
  assert(assignment.matchScore > 0, 'Match score should be greater than zero');
  assert(assignment.reasonCodes.includes('ROLE_MATCH') || assignment.reasonCodes.includes('DEFAULT_ROLE_FALLBACK'), 'Must contain role match code');
  assert(assignment.reasonCodes.includes('EXACT_CAPABILITY_MATCH') || assignment.reasonCodes.includes('PARTIAL_CAPABILITY_MATCH'), 'Must contain capability match code');

  console.log('   ✓ Multi-Agent Comparison & Optimal Selection: PASSED');
}

async function testCustomAgentRegistryInjectionModelAgnostic() {
  console.log('[Test 4] Custom Agent Registry Injection (Model Agnostic)...');

  const timestamp = '2026-07-29T12:00:00.000Z';
  const taskContract = TaskGateway.processCEODecision({
    ceoInput: '新言語の機能開発とコード実装',
    timestamp
  }).contract;

  const customAgent: AgentProfile = Object.freeze({
    agentId: 'AGENT-CUSTOM-NEXTGEN',
    agentName: 'NextGen Autonomous Worker',
    provider: 'LocalAI Consortium',
    supportedRoles: Object.freeze(['IMPLEMENTATION_ENGINEER']),
    capabilities: Object.freeze<ReadonlyArray<CapabilityType>>(['TYPESCRIPT', 'TESTING', 'GIT', 'SECURITY', 'ARCHITECTURE']),
    priorityWeight: 2.0
  });

  const customRegistry = new AgentRegistry([customAgent]);
  const assignment = AgentDispatcher.dispatch(taskContract, timestamp, customRegistry);

  assert(assignment.selectedAgent.agentId === 'AGENT-CUSTOM-NEXTGEN', 'Dispatcher must select custom injected agent');
  assert(assignment.selectedAgent.provider === 'LocalAI Consortium', 'Provider must match custom injected agent');
  assert(assignment.reasonCodes.includes('PRIORITY_WEIGHT_BOOST'), 'Should include PRIORITY_WEIGHT_BOOST code');

  console.log('   ✓ Custom Agent Registry Injection (Model Agnostic): PASSED');
}

async function testAssignmentContractImmutability() {
  console.log('[Test 5] Assignment Contract Immutability Verification...');

  const timestamp = '2026-07-29T12:00:00.000Z';
  const taskContract = TaskGateway.processCEODecision({
    ceoInput: '不変性検証テストタスク',
    timestamp
  }).contract;

  const assignment = AgentDispatcher.dispatch(taskContract, timestamp);

  assert(Object.isFrozen(assignment), 'AssignmentContract must be frozen');
  assert(Object.isFrozen(assignment.selectedAgent), 'selectedAgent must be frozen');
  assert(Object.isFrozen(assignment.requiredCapabilities), 'requiredCapabilities must be frozen');
  assert(Object.isFrozen(assignment.reasonCodes), 'reasonCodes must be frozen');

  let mutationPrevented = false;
  try {
    (assignment as any).matchScore = 999;
  } catch {
    mutationPrevented = true;
  }
  assert(assignment.matchScore !== 999, 'Property mutation must be prevented on frozen AssignmentContract');

  console.log('   ✓ Assignment Contract Immutability Verification: PASSED');
}

async function testStrictDeterminismAndSideEffectFree() {
  console.log('[Test 6] Strict Determinism & Side-Effect Free Verification...');

  const timestamp = '2026-07-29T15:30:00.000Z';
  const taskContract = TaskGateway.processCEODecision({
    ceoInput: '決定論的ディスパッチ検証タスク',
    timestamp
  }).contract;

  const registry = AgentRegistry.createDefaultRegistry();

  const dispatchA = AgentDispatcher.dispatch(taskContract, timestamp, registry);
  const dispatchB = AgentDispatcher.dispatch(taskContract, timestamp, registry);

  assert(dispatchA.assignmentId === dispatchB.assignmentId, 'Assignment ID must be identical across calls');
  assert(dispatchA.selectedAgent.agentId === dispatchB.selectedAgent.agentId, 'Selected Agent ID must be identical');
  assert(dispatchA.matchScore === dispatchB.matchScore, 'Match score must be identical');
  assert(
    JSON.stringify(dispatchA) === JSON.stringify(dispatchB),
    'Complete serialized AssignmentContract JSON must match identically for deterministic inputs'
  );

  console.log('   ✓ Strict Determinism & Side-Effect Free Verification: PASSED');
}

async function runAll() {
  console.log('--- Starting Task Dispatcher Foundation Unit Tests ---');
  await testRoleMatchingAndResolution();
  await testTypedCapabilityMatchScoringAndReasonCodes();
  await testMultiAgentComparisonAndOptimalSelection();
  await testCustomAgentRegistryInjectionModelAgnostic();
  await testAssignmentContractImmutability();
  await testStrictDeterminismAndSideEffectFree();
  console.log('--- All Task Dispatcher Foundation Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
