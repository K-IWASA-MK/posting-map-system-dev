/**
 * test_aios_constitution_foundation.ts
 * 
 * Comprehensive Unit Test Suite for Sprint G10-1: AIOS Constitution Foundation.
 */

import { 
  AIOSConstitution,
  STANDARD_PRINCIPLE_IDS,
  KnowledgeBoundary,
  ArtifactOwnership,
  DispatchPolicy,
  KnowledgeSanitizationPolicy,
  ConstitutionPrinciple
} from '../../../src/constitution';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function test1_ConstitutionVersionAndImmutability() {
  console.log('[Test 1] Constitution Version and Immutability Verification...');
  const constitution = AIOSConstitution.getV1();

  assert(constitution.version === '1.0', 'Constitution version must be 1.0');
  assert(Object.isFrozen(constitution), 'AIOSConstitution instance must be frozen (immutable)');
  assert(Object.isFrozen(constitution.principles), 'Principles list must be frozen');
  assert(Object.isFrozen(constitution.rules), 'Rules list must be frozen');

  console.log(' -> Constitution Version & Immutability PASSED.');
}

async function test2_StandardPrinciplesCompleteness() {
  console.log('\n[Test 2] Standard Principles 001-006 Verification...');
  const constitution = AIOSConstitution.getV1();

  assert(constitution.principles.length === 6, 'Must contain exactly 6 standard principles');

  const p1 = constitution.getPrinciple(STANDARD_PRINCIPLE_IDS.DISPATCH_PRINCIPLE);
  assert(p1 !== undefined && p1.code === 'PRINCIPLE_001', 'Principle 001 must exist');

  const p2 = constitution.getPrinciple(STANDARD_PRINCIPLE_IDS.PROJECT_OWNERSHIP_PRINCIPLE);
  assert(p2 !== undefined && p2.code === 'PRINCIPLE_002', 'Principle 002 must exist');

  const p3 = constitution.getPrinciple(STANDARD_PRINCIPLE_IDS.KNOWLEDGE_BOUNDARY_PRINCIPLE);
  assert(p3 !== undefined && p3.code === 'PRINCIPLE_003', 'Principle 003 must exist');

  const p4 = constitution.getPrinciple(STANDARD_PRINCIPLE_IDS.NO_ARTIFACT_RETENTION_PRINCIPLE);
  assert(p4 !== undefined && p4.code === 'PRINCIPLE_004', 'Principle 004 must exist');

  const p5 = constitution.getPrinciple(STANDARD_PRINCIPLE_IDS.KNOWLEDGE_SANITIZATION_PRINCIPLE);
  assert(p5 !== undefined && p5.code === 'PRINCIPLE_005', 'Principle 005 must exist');

  const p6 = constitution.getPrinciple(STANDARD_PRINCIPLE_IDS.PROJECT_AUTONOMY_PRINCIPLE);
  assert(p6 !== undefined && p6.code === 'PRINCIPLE_006', 'Principle 006 must exist');
  assert(p6?.category === 'AUTONOMY', 'Principle 006 category must be AUTONOMY');

  console.log(' -> Standard Principles 001-006 Verification PASSED.');
}

async function test3_ImmutablePrincipleExtension() {
  console.log('\n[Test 3] Immutable Principle Extension (withPrinciple) Verification...');
  const original = AIOSConstitution.getV1();

  const customPrinciple: ConstitutionPrinciple = {
    id: 'PRIN_007',
    code: 'PRINCIPLE_007',
    title: 'Future Audit Principle',
    category: 'EXTENDED',
    statement: 'Future governance rules must be logged.',
    rationale: 'Extensibility test'
  };

  const extended = original.withPrinciple(customPrinciple);

  assert(original.principles.length === 6, 'Original constitution principles count must remain unchanged (6)');
  assert(extended.principles.length === 7, 'Extended constitution principles count must be 7');
  assert(extended.getPrinciple('PRIN_007') !== undefined, 'Extended principle PRIN_007 must exist in extended instance');
  assert(original.getPrinciple('PRIN_007') === undefined, 'Extended principle PRIN_007 must NOT exist in original instance');
  assert(Object.isFrozen(extended), 'Extended constitution must be frozen');

  console.log(' -> Immutable Principle Extension PASSED.');
}

async function test4_ArtifactOwnershipVerification() {
  console.log('\n[Test 4] Artifact Ownership Verification...');
  const constitution = AIOSConstitution.getV1();

  const ownership = constitution.validateArtifactOwnership('art-001', 'POSTING_MAP');
  assert(ownership.projectId === 'POSTING_MAP', 'ProjectId must match');
  assert(ownership.mode === 'PROJECT_EXCLUSIVE', 'Mode must be PROJECT_EXCLUSIVE');
  assert(ownership.aiosOwnershipAllowed === false, 'AIOS ownership must be false');

  const directDesc = ArtifactOwnership.createProjectOwnership('art-002', 'HOKUSEI_CH');
  const validation = ArtifactOwnership.validateOwnership(directDesc);
  assert(validation.valid === true, 'Artifact ownership validation must pass');

  console.log(' -> Artifact Ownership Verification PASSED.');
}

async function test5_KnowledgeBoundaryVerification() {
  console.log('\n[Test 5] Knowledge Boundary Verification...');
  const constitution = AIOSConstitution.getV1();

  const resSkill = constitution.validateKnowledgeRetention('SKILL');
  assert(resSkill.allowed === true, 'SKILL category must be allowed');

  const resMetrics = constitution.validateKnowledgeRetention('METRICS');
  assert(resMetrics.allowed === true, 'METRICS category must be allowed');

  const resBestPractice = constitution.validateKnowledgeRetention('BEST_PRACTICE');
  assert(resBestPractice.allowed === true, 'BEST_PRACTICE category must be allowed');

  const resFiles = constitution.validateKnowledgeRetention('PROJECT_FILES');
  assert(resFiles.allowed === false, 'PROJECT_FILES category must be forbidden');

  const resSecrets = constitution.validateKnowledgeRetention('PROJECT_SECRETS');
  assert(resSecrets.allowed === false, 'PROJECT_SECRETS category must be forbidden');

  const resDb = constitution.validateKnowledgeRetention('PROJECT_DATABASE');
  assert(resDb.allowed === false, 'PROJECT_DATABASE category must be forbidden');

  console.log(' -> Knowledge Boundary Verification PASSED.');
}

async function test6_DispatchPolicyVerification() {
  console.log('\n[Test 6] Dispatch Policy Verification...');
  const requirement = DispatchPolicy.createDispatchRequirement('POSTING_MAP', 'emp-supervisor-01', 'task-999');

  const validation = DispatchPolicy.validateDispatch(requirement);
  assert(validation.valid === true, 'Dispatch policy validation must succeed');
  assert(requirement.returnArtifactsToProject === true, 'Must return artifacts to project');
  assert(requirement.zeroPlatformStateRetention === true, 'Must enforce zero platform state retention');
  assert(requirement.respectProjectAutonomy === true, 'Must respect project autonomy');

  console.log(' -> Dispatch Policy Verification PASSED.');
}

async function test7_KnowledgeSanitizationPolicyVerification() {
  console.log('\n[Test 7] Knowledge Sanitization Policy Verification...');
  
  const cleanContent = 'Always use parameter validation when receiving input in typescript handlers.';
  const cleanResult = KnowledgeSanitizationPolicy.verifySanitization(cleanContent, ['POSTING_MAP_PROD']);
  assert(cleanResult.isSanitized === true, 'Clean content must be verified as sanitized');
  assert(cleanResult.detectedProjectLeaks.length === 0, 'No leaks should be detected');

  const dirtyContent = 'Use database POSTING_MAP_PROD with api_key = "secret123" for connection.';
  const dirtyResult = KnowledgeSanitizationPolicy.verifySanitization(dirtyContent, ['POSTING_MAP_PROD']);
  assert(dirtyResult.isSanitized === false, 'Dirty content must fail sanitization');
  assert(dirtyResult.detectedProjectLeaks.length >= 2, 'Should detect project ID leak and api key leak');

  console.log(' -> Knowledge Sanitization Policy Verification PASSED.');
}

async function runAll() {
  console.log('========================================================');
  console.log('Sprint G10-1: AIOS Constitution Foundation Test Suite');
  console.log('========================================================');

  await test1_ConstitutionVersionAndImmutability();
  await test2_StandardPrinciplesCompleteness();
  await test3_ImmutablePrincipleExtension();
  await test4_ArtifactOwnershipVerification();
  await test5_KnowledgeBoundaryVerification();
  await test6_DispatchPolicyVerification();
  await test7_KnowledgeSanitizationPolicyVerification();

  console.log('\n========================================================');
  console.log('ALL AIOS CONSTITUTION FOUNDATION TESTS PASSED SUCCESSFULLY!');
  console.log('========================================================');
}

runAll().catch((err) => {
  console.error('[Test Failure]', err);
  process.exit(1);
});
