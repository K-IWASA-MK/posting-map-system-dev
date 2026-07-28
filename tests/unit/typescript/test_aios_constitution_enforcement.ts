/**
 * test_aios_constitution_enforcement.ts
 * 
 * Unit Test Suite for Sprint G10-2: AIOS Constitution Enforcement Foundation.
 * Verifies strict runtime enforcement of Constitution v1.0:
 * - SKILL is ACCEPTED for AIOS retention.
 * - EVERYTHING ELSE (Source Code, Documents, DB, Runtime State, Config, Images, Logs, etc.) is REJECTED and MANDATORY RETURN to Project.
 */

import { 
  ConstitutionEnforcement, 
  SkillRetentionValidator, 
  ProjectArtifactValidator 
} from '../../../src/constitution';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function test1_SkillAcceptance() {
  console.log('[Test 1] Skill Acceptance Verification...');
  
  const skillItem = {
    itemCategory: 'SKILL',
    itemIdentifier: 'skill-typescript-refactoring-v1'
  };

  const evalResult = ConstitutionEnforcement.evaluateItem(skillItem);
  assert(evalResult.decision.aiosRetention === 'ACCEPT_AIOS_RETENTION', 'SKILL must be ACCEPTED for AIOS retention');
  assert(evalResult.decision.primaryDestination === 'AIOS_PLATFORM', 'Primary destination for SKILL must be AIOS_PLATFORM');
  assert(evalResult.violations.length === 0, 'No violations should occur for SKILL');

  console.log(' -> Skill Acceptance PASSED.');
}

async function test2_NonSkillRejectionMatrix() {
  console.log('\n[Test 2] Non-Skill Categories Rejection Matrix Verification (Everything Else)...');

  const nonSkillCategories = [
    'SOURCE_CODE',
    'DOCUMENTS',
    'DATABASE',
    'RUNTIME_STATE',
    'CONFIGURATION',
    'GENERATED_FILES',
    'IMAGES',
    'PROJECT_LOGS',
    'PROJECT_FILES',
    'PROJECT_SECRETS'
  ];

  for (const cat of nonSkillCategories) {
    const item = {
      itemCategory: cat,
      itemIdentifier: `asset-${cat.toLowerCase()}-001`
    };

    const evalResult = ConstitutionEnforcement.evaluateItem(item);
    assert(evalResult.decision.aiosRetention === 'REJECT_AIOS_RETENTION', `Category '${cat}' MUST be REJECTED from AIOS retention`);
    assert(evalResult.decision.projectReturn === 'MANDATORY_PROJECT_RETURN', `Category '${cat}' MUST be marked for MANDATORY_PROJECT_RETURN`);
    assert(evalResult.decision.primaryDestination === 'REQUESTING_PROJECT', `Category '${cat}' primary destination MUST be REQUESTING_PROJECT`);
    assert(evalResult.violations.length > 0, `Category '${cat}' MUST produce a ConstitutionViolation report`);
    console.log(` -> Category '${cat}' -> REJECT AIOS, MANDATORY PROJECT RETURN Verified.`);
  }

  console.log(' -> Non-Skill Rejection Matrix PASSED.');
}

async function test3_BatchEnforcementEvaluation() {
  console.log('\n[Test 3] Batch Enforcement Evaluation Verification...');

  const batchItems = [
    { itemCategory: 'SKILL', itemIdentifier: 'skill-pattern-extraction' },
    { itemCategory: 'SOURCE_CODE', itemIdentifier: 'src/main.ts' },
    { itemCategory: 'DOCUMENTS', itemIdentifier: 'docs/spec.md' },
    { itemCategory: 'DATABASE', itemIdentifier: 'db/users.sql' }
  ];

  const batchResult = ConstitutionEnforcement.evaluateBatch(batchItems);

  assert(batchResult.evaluatedItemCount === 4, 'Must evaluate 4 items');
  assert(batchResult.allowedForAIOS === false, 'Batch containing non-skill assets must return allowedForAIOS = false');
  assert(batchResult.decisions.length === 4, 'Must have 4 decision descriptors');
  assert(batchResult.violations.length === 3, 'Must report 3 non-skill violations');

  const skillDec = batchResult.decisions.find(d => d.itemIdentifier === 'skill-pattern-extraction');
  assert(skillDec?.aiosRetention === 'ACCEPT_AIOS_RETENTION', 'Skill item in batch must be accepted');

  const codeDec = batchResult.decisions.find(d => d.itemIdentifier === 'src/main.ts');
  assert(codeDec?.aiosRetention === 'REJECT_AIOS_RETENTION', 'Source code item in batch must be rejected');

  console.log(' -> Batch Enforcement Evaluation PASSED.');
}

async function test4_StrictSkillRetentionValidator() {
  console.log('\n[Test 4] Strict SkillRetentionValidator Verification...');

  assert(SkillRetentionValidator.isSkillCategory('SKILL') === true, 'SKILL must be recognized as skill category');
  assert(SkillRetentionValidator.isSkillCategory('Skill') === true, 'Skill case-insensitive must be recognized');
  assert(SkillRetentionValidator.isSkillCategory('KNOWLEDGE') === false, 'KNOWLEDGE must NOT be recognized as skill category under strict rule');
  assert(SkillRetentionValidator.isSkillCategory('DOCUMENT') === false, 'DOCUMENT must NOT be recognized as skill category');

  const skillRes = SkillRetentionValidator.validateSkillRetention('SKILL', 'sk-1');
  assert(skillRes.isSkillOnly === true, 'SKILL validation must return isSkillOnly = true');
  assert(skillRes.violation === undefined, 'SKILL validation must not produce violation');

  const nonSkillRes = SkillRetentionValidator.validateSkillRetention('DOCUMENT', 'doc-1');
  assert(nonSkillRes.isSkillOnly === false, 'DOCUMENT validation must return isSkillOnly = false');
  assert(nonSkillRes.violation !== undefined, 'DOCUMENT validation must produce violation');

  console.log(' -> Strict SkillRetentionValidator PASSED.');
}

async function runAll() {
  console.log('========================================================');
  console.log('Sprint G10-2: AIOS Constitution Enforcement Test Suite');
  console.log('========================================================');

  await test1_SkillAcceptance();
  await test2_NonSkillRejectionMatrix();
  await test3_BatchEnforcementEvaluation();
  await test4_StrictSkillRetentionValidator();

  console.log('\n========================================================');
  console.log('ALL CONSTITUTION ENFORCEMENT TESTS PASSED SUCCESSFULLY!');
  console.log('========================================================');
}

runAll().catch((err) => {
  console.error('[Test Failure]', err);
  process.exit(1);
});
