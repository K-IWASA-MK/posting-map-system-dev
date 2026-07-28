/**
 * test_evidence_storage_integration.ts
 * 
 * Evidence Storage & Governance Gate Integration Unit Test Suite (Phase 5)
 */

import fs from 'fs';
import path from 'path';
import {
  EvidenceIntegrityManager,
  EvidenceStorageManager,
  ProductionAssetExtractor,
  VerificationEvidencePackage,
  VerificationGovernanceGateBridge
} from '../../../sdk/verification';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testEvidenceStorageAndIntegrityManager() {
  console.log('[Test] Evidence Storage & SHA-256 Integrity Manager starting...');

  const tempBaseDir = path.join(process.cwd(), 'scratch', 'test_evidence');
  if (fs.existsSync(tempBaseDir)) {
    fs.rmSync(tempBaseDir, { recursive: true, force: true });
  }

  const samplePackage: VerificationEvidencePackage = Object.freeze({
    verificationId: 'verif-pkg-test-01',
    taskId: 'TASK-001',
    timestamp: new Date().toISOString(),
    gitCommit: '3d54496a7ab1',
    capabilitySnapshot: Object.freeze({
      snapshotId: 'snap-01',
      timestamp: new Date().toISOString(),
      capabilities: Object.freeze([]),
      overallStatus: 'READY'
    }),
    screenshots: Object.freeze(['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==']),
    consoleLogs: Object.freeze([{ level: 'info', message: 'Test log' }]),
    networkLogs: Object.freeze([{ url: 'http://localhost/api', status: 200 }]),
    domSnapshot: '<html><body>Verified App</body></html>',
    finalStatus: 'PASS',
    completionGatePassed: true
  });

  const saveResult = await EvidenceStorageManager.saveEvidencePackage(samplePackage, tempBaseDir);

  assert(fs.existsSync(saveResult.packageDir), 'Package dir should exist');
  assert(fs.existsSync(saveResult.manifestPath), 'Integrity manifest should exist');
  assert(saveResult.screenshotPaths.length === 1, 'Screenshot should be saved');

  // Verify integrity PASS
  const integrityCheck = EvidenceIntegrityManager.verifyIntegrity(saveResult.packageDir, saveResult.integrityManifest);
  assert(integrityCheck.valid === true, 'Integrity check should be valid for pristine saved evidence');

  // Tamper with a file and verify integrity FAIL
  const screenshotFile = saveResult.screenshotPaths[0];
  fs.appendFileSync(screenshotFile, 'TAMPERED_DATA');

  const tamperedCheck = EvidenceIntegrityManager.verifyIntegrity(saveResult.packageDir, saveResult.integrityManifest);
  assert(tamperedCheck.valid === false, 'Integrity check must fail when file is tampered');
  assert(tamperedCheck.tamperedFiles.length >= 1, 'Tampered files list should contain the altered file');

  console.log('   ✓ Evidence Storage & SHA-256 Integrity Manager: PASSED');
}

async function testProductionAssetExtractor() {
  console.log('[Test] Production Asset Extractor starting...');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="version" content="0f3f6c9a8e4a">
      </head>
      <body>
        <script>
          window.__BUILD_INFO__ = { commit: "0f3f6c9a8e4a", build: "20260728" };
        </script>
      </body>
    </html>
  `;

  const extracted = ProductionAssetExtractor.extractMetadata(htmlContent);
  assert(extracted.commitHash === '0f3f6c9a8e4a', 'Extracted commit hash mismatch');
  assert(ProductionAssetExtractor.verifyCommitMatch(htmlContent, '0f3f6c9a8e4a'), 'verifyCommitMatch should return true for exact commit');
  assert(ProductionAssetExtractor.verifyCommitMatch(htmlContent, '0f3f6c9'), 'verifyCommitMatch should return true for short commit');
  assert(!ProductionAssetExtractor.verifyCommitMatch(htmlContent, 'deadbeef1234'), 'verifyCommitMatch should return false for mismatched commit');

  console.log('   ✓ Production Asset Extractor: PASSED');
}

async function testVerificationGovernanceGateBridge() {
  console.log('[Test] Verification Governance Gate Bridge 9-rule evaluation starting...');

  const samplePackage: VerificationEvidencePackage = Object.freeze({
    verificationId: 'verif-gov-test-01',
    taskId: 'TASK-002',
    timestamp: new Date().toISOString(),
    gitCommit: '0f3f6c9a8e4a',
    capabilitySnapshot: Object.freeze({
      snapshotId: 'snap-02',
      timestamp: new Date().toISOString(),
      capabilities: Object.freeze([]),
      overallStatus: 'READY'
    }),
    deploymentResult: Object.freeze({
      verificationId: 'dep-01',
      status: 'PASS',
      workflowRunId: 'run-1',
      workflowName: 'deploy',
      workflowConclusion: 'SUCCESS',
      deployedCommit: '0f3f6c9a8e4a',
      expectedCommit: '0f3f6c9a8e4a',
      commitMatch: true,
      assetHashMatch: true,
      productionResponseTimeMs: 120,
      evidence: Object.freeze({})
    }),
    browserResult: Object.freeze({
      verificationId: 'br-01',
      status: 'PASS',
      targetUrl: 'https://area-management.github.io/posting-map-system/',
      durationMs: 400,
      screenshotCount: 1,
      domSnapshotLength: 100,
      consoleLogCount: 1,
      networkLogCount: 1,
      evidence: Object.freeze({
        screenshots: Object.freeze(['data:image/png;base64,sample']),
        domSnapshot: '<html></html>',
        consoleLogs: Object.freeze([]),
        networkLogs: Object.freeze([])
      })
    }),
    screenshots: Object.freeze(['data:image/png;base64,sample']),
    consoleLogs: Object.freeze([]),
    networkLogs: Object.freeze([]),
    domSnapshot: '<html></html>',
    finalStatus: 'PASS',
    completionGatePassed: true
  });

  const evaluation = VerificationGovernanceGateBridge.evaluateCompletionGate(samplePackage);
  assert(evaluation.decision === 'ALLOW', 'Evaluation decision should be ALLOW when all rules pass');
  assert(evaluation.score === 100, 'Score should be 100');
  assert(evaluation.passedRulesCount === 9, 'Passed rules count should be 9');

  // Test BLOCKED evaluation when a rule fails (e.g. deployment workflow failed)
  const failedDeploymentPackage: VerificationEvidencePackage = {
    ...samplePackage,
    deploymentResult: Object.freeze({
      ...samplePackage.deploymentResult!,
      status: 'FAIL',
      workflowConclusion: 'FAILURE'
    })
  };

  const blockedEvaluation = VerificationGovernanceGateBridge.evaluateCompletionGate(failedDeploymentPackage);
  assert(blockedEvaluation.decision === 'BLOCK', 'Evaluation decision should be BLOCK when workflow fails');
  assert(blockedEvaluation.reason.includes('Governance Gate BLOCKED'), 'Reason should explain block');

  console.log('   ✓ Verification Governance Gate Bridge 9-rule evaluation: PASSED');
}

async function runAll() {
  console.log('--- Starting Evidence Storage & Governance Gate Integration Unit Tests ---');
  await testEvidenceStorageAndIntegrityManager();
  await testProductionAssetExtractor();
  await testVerificationGovernanceGateBridge();
  console.log('--- All Evidence Storage & Governance Gate Integration Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
