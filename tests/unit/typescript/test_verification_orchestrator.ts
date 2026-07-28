/**
 * test_verification_orchestrator.ts
 * 
 * AI Employee Verification Orchestrator & Evidence Package Unit Test Suite (Phase 4-C)
 */

import {
  AIEmployeeVerificationOrchestrator,
  BrowserVerificationActionType,
  GitHubActionsVerificationProvider,
  VerificationCapabilityRegistry
} from '../../../sdk/verification';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testFullOrchestratedTaskVerification() {
  console.log('[Test] Full Orchestrated Task Verification starting...');
  VerificationCapabilityRegistry.clear();

  const gitHubProvider = new GitHubActionsVerificationProvider();
  gitHubProvider.setMockWorkflowRun('area-management/posting-map-system', {
    runId: 'run-gate-pass',
    workflowName: 'deploy',
    status: 'SUCCESS',
    headCommit: 'f24293815996'
  });

  const orchestrator = new AIEmployeeVerificationOrchestrator();

  const summary = await orchestrator.executeTaskVerification({
    taskId: 'TASK-POSTING-MAP-009',
    gitCommit: 'f24293815996',
    deploymentRequest: {
      verificationId: 'dep-verif-task-009',
      repository: 'area-management/posting-map-system',
      productionUrl: 'https://area-management.github.io/posting-map-system/',
      expectedCommit: 'f24293815996'
    },
    browserRequest: {
      verificationId: 'browser-verif-task-009',
      targetUrl: 'https://area-management.github.io/posting-map-system/',
      actions: [
        { type: BrowserVerificationActionType.NAVIGATE },
        { type: BrowserVerificationActionType.SCREENSHOT },
        { type: BrowserVerificationActionType.DOM_SNAPSHOT }
      ]
    }
  });

  assert(summary.finalStatus === 'PASS', 'Orchestration finalStatus should be PASS');
  assert(summary.completionGatePassed === true, 'completionGatePassed should be true');

  // Verify Evidence Package
  const pkg = summary.evidencePackage;
  assert(pkg.verificationId === summary.verificationId, 'Evidence package verificationId mismatch');
  assert(pkg.taskId === 'TASK-POSTING-MAP-009', 'Evidence package taskId mismatch');
  assert(pkg.gitCommit === 'f24293815996', 'Evidence package gitCommit mismatch');
  assert(pkg.screenshots.length >= 1, 'Evidence package must contain screenshots');
  assert(pkg.domSnapshot !== undefined, 'Evidence package must contain DOM snapshot');
  assert(summary.reportSummary.includes('Completion Gate     : PASS'), 'Report summary should contain PASS');

  console.log('   ✓ Full Orchestrated Task Verification: PASSED');
}

async function runAll() {
  console.log('--- Starting AI Employee Verification Orchestrator Unit Tests ---');
  await testFullOrchestratedTaskVerification();
  console.log('--- All AI Employee Verification Orchestrator Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
