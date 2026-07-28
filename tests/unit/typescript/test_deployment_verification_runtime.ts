/**
 * test_deployment_verification_runtime.ts
 * 
 * Deployment Verification Runtime Unit Test Suite (Phase 4-B)
 */

import {
  DeploymentVerificationRuntime,
  GitHubActionsVerificationProvider
} from '../../../sdk/verification';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testSuccessfulDeploymentVerification() {
  console.log('[Test] Successful Deployment Verification starting...');

  const provider = new GitHubActionsVerificationProvider();
  provider.setMockWorkflowRun('area-management/posting-map-system', {
    runId: 'run-999',
    workflowName: 'deploy',
    status: 'SUCCESS',
    headCommit: 'a1b2c3d4e5f6',
    logUrl: 'https://github.com/area-management/posting-map-system/actions/runs/999'
  });

  const runtime = new DeploymentVerificationRuntime({
    gitHubProvider: provider,
    bypassCapabilityCheck: true
  });

  const result = await runtime.verifyDeployment({
    verificationId: 'dep-verif-01',
    repository: 'area-management/posting-map-system',
    productionUrl: 'https://area-management.github.io/posting-map-system/',
    expectedCommit: 'a1b2c3d4e5f6'
  });

  assert(result.status === 'PASS', 'Deployment verification should PASS');
  assert(result.workflowConclusion === 'SUCCESS', 'Workflow conclusion should be SUCCESS');
  assert(result.commitMatch === true, 'Commit match should be true');
  assert(result.assetHashMatch === true, 'Asset hash match should be true');

  console.log('   ✓ Successful Deployment Verification: PASSED');
}

async function testFailedWorkflowBlockedVerification() {
  console.log('[Test] Failed GitHub Actions Workflow Blocked Verification starting...');

  const provider = new GitHubActionsVerificationProvider();
  provider.setMockWorkflowRun('area-management/posting-map-system', {
    runId: 'run-1000',
    workflowName: 'deploy',
    status: 'FAILURE',
    headCommit: 'a1b2c3d4e5f6',
    logUrl: 'https://github.com/area-management/posting-map-system/actions/runs/1000',
    failureReason: 'Build failed during tsc compilation'
  });

  const runtime = new DeploymentVerificationRuntime({
    gitHubProvider: provider,
    bypassCapabilityCheck: true
  });

  const result = await runtime.verifyDeployment({
    verificationId: 'dep-verif-02',
    repository: 'area-management/posting-map-system',
    productionUrl: 'https://area-management.github.io/posting-map-system/',
    expectedCommit: 'a1b2c3d4e5f6'
  });

  assert(result.status === 'FAIL', 'Deployment verification should FAIL when workflow fails');
  assert(result.workflowConclusion === 'FAILURE', 'Workflow conclusion should be FAILURE');
  assert(Boolean(result.error && result.error.includes('Build failed')), 'Error should contain workflow failure reason');

  console.log('   ✓ Failed GitHub Actions Workflow Blocked Verification: PASSED');
}

async function runAll() {
  console.log('--- Starting Deployment Verification Runtime Unit Tests ---');
  await testSuccessfulDeploymentVerification();
  await testFailedWorkflowBlockedVerification();
  console.log('--- All Deployment Verification Runtime Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
