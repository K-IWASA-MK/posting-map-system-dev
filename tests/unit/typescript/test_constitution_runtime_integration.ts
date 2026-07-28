/**
 * test_constitution_runtime_integration.ts
 * 
 * Comprehensive Test Suite for Sprint G10-3: Constitution Runtime Integration.
 */

import { ConstitutionRuntimeGate, ConstitutionRuntimeContextFactory } from '../../../src/runtime/constitution';
import { ProjectBridgeRuntime } from '../../../sdk/project/bridge/ProjectBridgeRuntime';
import { BootstrapManager } from '../../../sdk/runtime';
import { ProjectBridgeRuntime as ProjectBridgeRuntimeClass } from '../../../sdk/project/bridge/ProjectBridgeRuntime';
import { ProjectEventPublisher } from '../../../sdk/project/event/ProjectEventPublisher';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function test1_SkillGateEvaluation() {
  console.log('[Test 1] ConstitutionRuntimeGate Skill Evaluation Verification...');

  const context = ConstitutionRuntimeContextFactory.create('POSTING_MAP', 'emp-worker-01', 'task-001', [
    { itemCategory: 'SKILL', itemIdentifier: 'skill-address-parsing-v1' }
  ]);

  const decision = ConstitutionRuntimeGate.evaluateRetention(context);

  assert(decision.passedGate === true, 'Gate must pass evaluation');
  assert(decision.aiosRetentionAllowed === true, 'SKILL item must be allowed for AIOS retention');
  assert(decision.mandatoryProjectReturnEnforced === false, 'SKILL item does not enforce mandatory project return');
  assert(decision.itemDetails[0].action === 'ACCEPT_SKILL', 'Action must be ACCEPT_SKILL');

  console.log(' -> Skill Gate Evaluation PASSED.');
}

async function test2_ProjectArtifactGateEvaluation() {
  console.log('\n[Test 2] ConstitutionRuntimeGate Non-Skill Artifact Evaluation Verification...');

  const context = ConstitutionRuntimeContextFactory.create('POSTING_MAP', 'emp-worker-01', 'task-002', [
    { itemCategory: 'DOCUMENT', itemIdentifier: 'doc-report.md' },
    { itemCategory: 'SOURCE_CODE', itemIdentifier: 'src/handler.ts' },
    { itemCategory: 'GENERATED_FILES', itemIdentifier: 'output/data.csv' }
  ]);

  const decision = ConstitutionRuntimeGate.evaluateRetention(context);

  assert(decision.passedGate === true, 'Gate must pass evaluation');
  assert(decision.aiosRetentionAllowed === false, 'Non-skill items MUST NOT be allowed for AIOS retention');
  assert(decision.mandatoryProjectReturnEnforced === true, 'Non-skill items MUST enforce MANDATORY project return');
  assert(decision.itemDetails.every(i => i.action === 'RETURN_TO_PROJECT'), 'All non-skill items must have action RETURN_TO_PROJECT');

  console.log(' -> Project Artifact Gate Evaluation PASSED.');
}

async function test3_ProjectBridgeRuntimeGateIntegration() {
  console.log('\n[Test 3] ProjectBridgeRuntime & ConstitutionRuntimeGate Wiring Verification...');

  BootstrapManager.clear();
  ProjectBridgeRuntimeClass.clear();
  ProjectEventPublisher.clear();
  BootstrapManager.initialize();

  const bridge = new ProjectBridgeRuntime();
  const request = {
    requestId: 'req-gate-001',
    projectId: 'FIELD_OPERATIONS',
    taskType: 'EXECUTE_FIELD_VERIFICATION',
    payload: { district: 'Mie-03' },
    parameters: {},
    timestamp: new Date().toISOString()
  };

  const output = bridge.submitTask(request);

  assert(output.response.status === 'ACCEPTED', 'Intake must be ACCEPTED');
  assert(output.result !== undefined && Boolean(output.result.completed), 'Result must be COMPLETED');

  const result = output.result!;
  assert(result.producedArtifacts.length > 0, 'Artifacts must be produced');

  // Verify ConstitutionRuntimeGate evaluation of produced artifacts
  const gateDecision = ConstitutionRuntimeGate.evaluateResultArtifacts(
    request.projectId,
    output.response.taskId,
    result.producedArtifacts.map(art => ({ artifactId: art.artifactId, artifactType: art.artifactType }))
  );

  assert(gateDecision.aiosRetentionAllowed === false, 'Produced project artifacts must be REJECTED from AIOS platform retention');
  assert(gateDecision.mandatoryProjectReturnEnforced === true, 'Produced project artifacts must be enforced for MANDATORY PROJECT RETURN');

  console.log(' -> ProjectBridgeRuntime Gate Wiring PASSED.');
}

async function runAll() {
  console.log('========================================================');
  console.log('Sprint G10-3: Constitution Runtime Integration Test Suite');
  console.log('========================================================');

  await test1_SkillGateEvaluation();
  await test2_ProjectArtifactGateEvaluation();
  await test3_ProjectBridgeRuntimeGateIntegration();

  console.log('\n========================================================');
  console.log('ALL CONSTITUTION RUNTIME INTEGRATION TESTS PASSED SUCCESSFULLY!');
  console.log('========================================================');
}

runAll().catch((err) => {
  console.error('[Test Failure]', err);
  process.exit(1);
});
