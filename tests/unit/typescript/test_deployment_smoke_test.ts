/**
 * test_deployment_smoke_test.ts
 * 
 * Deployment Target Verification Gate - Gate-008 Deployment Smoke Test Suite (Sprint DTVG-07)
 * デプロイ後の公開実環境を模擬し、Test-001 ～ Test-008 の正常系・異常系テストを自動検証する。
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { DeploymentSmokeTest } from '../../../aios/release/gates/smoke/DeploymentSmokeTest';
import { DeploymentFingerprintVerifier } from '../../../aios/release/gates/verifiers/DeploymentFingerprintVerifier';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('🧪 Starting Gate-008 Deployment Smoke Test Automation Suite...\n');

  const tmpDir = path.join(os.tmpdir(), `smoke-test-${Date.now()}`);
  fs.mkdirSync(tmpDir, { recursive: true });

  const smokeTest = new DeploymentSmokeTest(tmpDir);

  // Setup mock public asset files
  const indexHtmlPath = path.join(tmpDir, 'index.html');
  const indexHtmlContent = `<!DOCTYPE html><html><head><title>Posting Map</title></head><body><script src="config.js"></script></body></html>`;
  fs.writeFileSync(indexHtmlPath, indexHtmlContent, 'utf-8');

  const configJsPath = path.join(tmpDir, 'config.js');
  const configJsContent = `window.APP_CONFIG = { gasWebAppUrl: "https://script.google.com/macros/s/AKfycbxy1_MOCK/exec", version: "1.0.0" };`;
  fs.writeFileSync(configJsPath, configJsContent, 'utf-8');

  const mainHash = DeploymentFingerprintVerifier.hashContent(indexHtmlContent);

  // ==========================================
  // Test Scenario 1: Normal Flow (PASS)
  // ==========================================
  {
    console.log('  [1/4] Testing Normal Smoke Test Lifecycle (PASS)...');

    const result = await smokeTest.execute({
      releaseId: 'REL-SMOKE-001',
      version: '1.0.0',
      publicUrl: indexHtmlPath,
      expectedBackendEndpoint: 'https://script.google.com/macros/s/AKfycbxy1_MOCK/exec',
      expectedVersion: '1.0.0',
      expectedFingerprintHash: mainHash
    });

    assert(result.gateId === 'Gate-008', 'GateId must be Gate-008.');
    assert(result.overallStatus === 'PASS', 'Overall status must be PASS for valid deployment.');
    assert(result.checks.length === 8, 'Should run all 8 sub-checks (Test-001 to Test-008).');

    const t1 = result.checks.find(c => c.checkId === 'Test-001');
    const t3 = result.checks.find(c => c.checkId === 'Test-003');
    const t5 = result.checks.find(c => c.checkId === 'Test-005');
    const t6 = result.checks.find(c => c.checkId === 'Test-006');

    assert(t1?.status === 'PASS', 'Test-001 Public Endpoint Check must PASS.');
    assert(t3?.status === 'PASS', 'Test-003 Runtime Config Check must PASS.');
    assert(t5?.status === 'PASS', 'Test-005 Version Match must PASS.');
    assert(t6?.status === 'PASS', 'Test-006 Fingerprint Verification must PASS.');

    console.log('   ✓ Normal Smoke Test Lifecycle verified.');
  }

  // ==========================================
  // Test Scenario 2: Config Mismatch Error Flow (FAIL)
  // ==========================================
  {
    console.log('  [2/4] Testing Config Mismatch (Old GAS Deployment ID) (FAIL)...');

    const result = await smokeTest.execute({
      releaseId: 'REL-SMOKE-002',
      version: '1.0.0',
      publicUrl: indexHtmlPath,
      expectedBackendEndpoint: 'https://script.google.com/macros/s/OLD_STALE_DEPLOYMENT_ID/exec', // Stale endpoint!
      expectedVersion: '1.0.0'
    });

    assert(result.overallStatus === 'FAIL', 'Overall status must be FAIL when backend endpoint mismatches.');
    const t3 = result.checks.find(c => c.checkId === 'Test-003');
    assert(t3?.status === 'FAIL', 'Test-003 Runtime Config Check must FAIL.');

    console.log('   ✓ Config Mismatch Error Flow verified.');
  }

  // ==========================================
  // Test Scenario 3: Endpoint 404 Error Flow (FAIL)
  // ==========================================
  {
    console.log('  [3/4] Testing Non-existent Endpoint 404 (FAIL)...');

    const nonExistentPath = path.join(tmpDir, 'does-not-exist-page.html');
    const result = await smokeTest.execute({
      releaseId: 'REL-SMOKE-003',
      version: '1.0.0',
      publicUrl: nonExistentPath,
      expectedBackendEndpoint: 'https://script.google.com/macros/s/AKfycbxy1_MOCK/exec',
      expectedVersion: '1.0.0'
    });

    assert(result.overallStatus === 'FAIL', 'Overall status must be FAIL for non-existent endpoint.');
    const t1 = result.checks.find(c => c.checkId === 'Test-001');
    assert(t1?.status === 'FAIL', 'Test-001 Public Endpoint Check must FAIL on 404.');

    console.log('   ✓ Endpoint 404 Error Flow verified.');
  }

  // ==========================================
  // Test Scenario 4: Version Mismatch Error Flow (FAIL)
  // ==========================================
  {
    console.log('  [4/4] Testing Version Mismatch (FAIL)...');

    const result = await smokeTest.execute({
      releaseId: 'REL-SMOKE-004',
      version: '2.0.0', // Expected version is 2.0.0 but public is 1.0.0
      publicUrl: indexHtmlPath,
      expectedBackendEndpoint: 'https://script.google.com/macros/s/AKfycbxy1_MOCK/exec',
      expectedVersion: '2.0.0'
    });

    assert(result.overallStatus === 'FAIL', 'Overall status must be FAIL for version mismatch.');
    const t5 = result.checks.find(c => c.checkId === 'Test-005');
    assert(t5?.status === 'FAIL', 'Test-005 Version Match must FAIL.');

    console.log('   ✓ Version Mismatch Error Flow verified.');
  }

  // Cleanup temp files
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch (e) {}

  console.log('\n==========================================');
  console.log('🎉 GATE-008 DEPLOYMENT SMOKE TEST SUITE PASSED');
  console.log('==========================================\n');
}

runTests().catch((err) => {
  console.error('❌ Gate-008 Smoke Test Suite Failed:', err);
  process.exit(1);
});
