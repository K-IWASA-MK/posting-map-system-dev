import assert from 'assert';
import { ExecutionDispatcher } from '../../../sdk/dispatcher/ExecutionDispatcher';
import { TaskContract } from '../../../sdk/gateway/models/TaskContractModels';
import { WorkflowProfile } from '../../../sdk/gateway/models/WorkflowProfile';

const DUMMY_WORKFLOW_PROFILE: WorkflowProfile = {
  workflowType: 'STANDARD_DEVELOPMENT',
  stages: [],
  outputPolicy: {
    language: 'ja',
    codeLanguage: 'en',
    documentationLanguage: 'ja'
  },
  completionPolicy: {
    requireVerification: false,
    requireGitCommit: false,
    requireGitPush: false,
    requireWalkthrough: false,
    requireHandover: false
  }
};

const DUMMY_OUTPUT_POLICY = {
  primaryLanguage: 'JA' as const,
  allowEnglishTechnicalTerms: true,
  rules: [],
  specificationVersion: '1.0'
};

function createMockContract(intent: any, metadata: any): TaskContract {
  return {
    taskId: 'TASK-1000',
    intent,
    workflowProfile: DUMMY_WORKFLOW_PROFILE,
    workflowStages: [],
    priority: 'NORMAL',
    status: 'CONTRACT_GENERATED',
    outputLanguage: 'JA',
    outputPolicy: DUMMY_OUTPUT_POLICY,
    createdAt: new Date().toISOString(),
    definitionOfDone: [],
    ceoDecision: {
      ceoInput: 'dummy',
      timestamp: new Date().toISOString(),
      metadata
    }
  };
}

async function testLegacyRouting() {
  console.log('[Test 1] ExecutionDispatcher Legacy Routing Verification...');
  
  const contract = createMockContract('IMPLEMENTATION', {
    legacyOperation: 'submitDistribution'
  });

  const result = ExecutionDispatcher.dispatch(contract);

  assert(result.decision.dispatchTarget === 'LEGACY_RUNTIME', 'Should route to LEGACY_RUNTIME');
  assert(result.decision.adapterType === 'LEGACY_CONTRACT_ADAPTER', 'Should use LEGACY_CONTRACT_ADAPTER');
  assert(result.matchedRule === 'LEGACY_DISPATCH_RULE', 'Should match LEGACY_DISPATCH_RULE');
  assert(Object.isFrozen(result), 'Result must be immutable');
  assert(Object.isFrozen(result.decision), 'Decision must be immutable');

  console.log('   ✓ Legacy Routing Verification: PASSED');
}

async function testNativeRouting() {
  console.log('[Test 2] ExecutionDispatcher Native Routing Verification...');
  
  const contract = createMockContract('RESEARCH', {
    targetSystem: 'AIOS_NATIVE'
  });

  const result = ExecutionDispatcher.dispatch(contract);

  assert(result.decision.dispatchTarget === 'NATIVE_RUNTIME', 'Should route to NATIVE_RUNTIME');
  assert(result.decision.adapterType === 'NATIVE_ADAPTER', 'Should use NATIVE_ADAPTER');
  assert(result.matchedRule === 'NATIVE_DISPATCH_RULE', 'Should match NATIVE_DISPATCH_RULE');

  console.log('   ✓ Native Routing Verification: PASSED');
}

async function testIntentRouting() {
  console.log('[Test 3] ExecutionDispatcher Intent Routing (Fallback) Verification...');
  
  const contract = createMockContract('PLANNING', {});

  const result = ExecutionDispatcher.dispatch(contract);

  assert(result.decision.dispatchTarget === 'NATIVE_RUNTIME', 'Should fallback to NATIVE_RUNTIME');
  assert(result.decision.adapterType === 'NONE', 'Should use NONE adapter type');
  assert(result.matchedRule === 'INTENT_DISPATCH_RULE', 'Should match INTENT_DISPATCH_RULE');

  console.log('   ✓ Intent Routing Verification: PASSED');
}

async function testUnsupportedRouting() {
  console.log('[Test 4] ExecutionDispatcher Unsupported Routing Verification...');
  
  const contract = createMockContract('HOTFIX', {}); // No legacyOperation, No targetSystem, and Intent != PLANNING/RESEARCH

  try {
    ExecutionDispatcher.dispatch(contract);
    assert.fail('Should have thrown an error for unsupported context');
  } catch (err: any) {
    assert(err.message.includes('No matching dispatch rule found'), 'Unexpected error message: ' + err.message);
  }

  console.log('   ✓ Unsupported Routing Verification: PASSED');
}

async function runAll() {
  console.log('--- Starting Execution Dispatcher Foundation Unit Tests ---');
  await testLegacyRouting();
  await testNativeRouting();
  await testIntentRouting();
  await testUnsupportedRouting();
  console.log('--- All Execution Dispatcher Foundation Unit Tests PASSED ---');
}

if (require.main === module) {
  runAll().catch(err => {
    console.error('Test Suite Error:', err);
    process.exit(1);
  });
}
