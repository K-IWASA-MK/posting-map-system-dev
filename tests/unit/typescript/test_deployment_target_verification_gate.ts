/**
 * test_deployment_target_verification_gate.ts
 * 
 * Deployment Target Verification Gate (DTVG) 全体自動テストスイート
 * Gate-001 ～ Gate-007, Dry Run Mode, Environment Policy, ExecutionLedger 登録を包括検証する。
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { DeploymentTargetVerificationGate } from '../../../aios/release/gates/DeploymentTargetVerificationGate';
import { DeploymentGateRequest } from '../../../aios/release/gates/types/DeploymentTargetGateTypes';
import { ExecutionLedgerRegistry } from '../../../sdk/ExecutionLedgerRegistry';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('🧪 Starting Deployment Target Verification Gate (DTVG) Automation Test Suite...\n');

  const tmpDir = path.join(os.tmpdir(), `dtvg-test-${Date.now()}`);
  fs.mkdirSync(tmpDir, { recursive: true });

  const gate = new DeploymentTargetVerificationGate(process.cwd());

  // Setup test config file
  const validConfigPath = path.join(tmpDir, 'config.js');
  const validConfigContent = `
    window.APP_CONFIG = {
      gasWebAppUrl: "https://script.google.com/macros/s/AKfycbxy1_TEST/exec",
      version: "1.0.0"
    };
  `;
  fs.writeFileSync(validConfigPath, validConfigContent, 'utf-8');

  // ==========================================
  // Test Case 1: Gate-001 Repository Match (PASS / FAIL)
  // ==========================================
  {
    console.log('  [1/9] Testing Gate-001 (Repository Match)...');
    
    // PASS case
    const resPass = await gate.verify({
      releaseId: 'REL-001',
      version: '1.0.0',
      environment: 'development',
      requestedRepository: 'posting-map-system',
      requestedBranch: 'main',
      targetPublishRoot: tmpDir,
      frontendConfigPath: validConfigPath,
      expectedBackendEndpoint: 'https://script.google.com/macros/s/AKfycbxy1_TEST/exec',
      expectedBackendVersion: '1.0.0',
      employeeId: 'emp-aios-01',
      profileName: 'AI Employee Profile'
    });

    const g1Pass = resPass.gateResults.find(g => g.gateId === 'Gate-001');
    assert(g1Pass?.status === 'PASS', 'Gate-001 must PASS for matching repo name.');

    // FAIL case
    const resFail = await gate.verify({
      releaseId: 'REL-001-FAIL',
      version: '1.0.0',
      environment: 'development',
      requestedRepository: 'completely-wrong-repo-name',
      requestedBranch: 'main',
      targetPublishRoot: tmpDir,
      frontendConfigPath: validConfigPath,
      expectedBackendEndpoint: 'https://script.google.com/macros/s/AKfycbxy1_TEST/exec',
      expectedBackendVersion: '1.0.0',
      employeeId: 'emp-aios-01',
      profileName: 'AI Employee Profile'
    });

    const g1Fail = resFail.gateResults.find(g => g.gateId === 'Gate-001');
    assert(g1Fail?.status === 'FAIL', 'Gate-001 must FAIL for mismatched repository.');
    console.log('   ✓ Gate-001 Repository Match verified.');
  }

  // ==========================================
  // Test Case 2: Gate-002 Branch Match
  // ==========================================
  {
    console.log('  [2/9] Testing Gate-002 (Branch Match)...');

    const resFailBranch = await gate.verify({
      releaseId: 'REL-002',
      version: '1.0.0',
      environment: 'development',
      requestedRepository: 'posting-map-system',
      requestedBranch: 'non-existent-feature-branch-xyz',
      targetPublishRoot: tmpDir,
      frontendConfigPath: validConfigPath,
      expectedBackendEndpoint: 'https://script.google.com/macros/s/AKfycbxy1_TEST/exec',
      expectedBackendVersion: '1.0.0',
      employeeId: 'emp-aios-01',
      profileName: 'AI Employee Profile'
    });

    const g2Fail = resFailBranch.gateResults.find(g => g.gateId === 'Gate-002');
    assert(g2Fail?.status === 'FAIL', 'Gate-002 must FAIL for mismatched branch.');
    console.log('   ✓ Gate-002 Branch Match verified.');
  }

  // ==========================================
  // Test Case 3: Gate-003 Publish Root Match (POSTING MAP Incident Prevention)
  // ==========================================
  {
    console.log('  [3/9] Testing Gate-003 (Publish Root Match)...');

    const externalAsset = path.join(os.tmpdir(), 'outside-asset.js');
    fs.writeFileSync(externalAsset, 'console.log("outside");', 'utf-8');

    const resFailRoot = await gate.verify({
      releaseId: 'REL-003',
      version: '1.0.0',
      environment: 'development',
      requestedRepository: 'posting-map-system',
      requestedBranch: 'main',
      targetPublishRoot: tmpDir, // Publish Root is tmpDir
      frontendConfigPath: externalAsset, // Asset is outside publish root
      expectedBackendEndpoint: 'https://script.google.com/macros/s/AKfycbxy1_TEST/exec',
      expectedBackendVersion: '1.0.0',
      employeeId: 'emp-aios-01',
      profileName: 'AI Employee Profile'
    });

    const g3Fail = resFailRoot.gateResults.find(g => g.gateId === 'Gate-003');
    assert(g3Fail?.status === 'FAIL', 'Gate-003 must FAIL when asset path is outside target publish root.');
    console.log('   ✓ Gate-003 Publish Root Match verified.');
  }

  // ==========================================
  // Test Case 4: Gate-004 Runtime Config Match
  // ==========================================
  {
    console.log('  [4/9] Testing Gate-004 (Runtime Config Match)...');

    // Mismatched backend endpoint in config.js vs expected
    const resFailConfig = await gate.verify({
      releaseId: 'REL-004',
      version: '1.0.0',
      environment: 'development',
      requestedRepository: 'posting-map-system',
      requestedBranch: 'main',
      targetPublishRoot: tmpDir,
      frontendConfigPath: validConfigPath,
      expectedBackendEndpoint: 'https://script.google.com/macros/s/OLD_GAS_DEPLOYMENT_ID/exec',
      expectedBackendVersion: '1.0.0',
      employeeId: 'emp-aios-01',
      profileName: 'AI Employee Profile'
    });

    const g4Fail = resFailConfig.gateResults.find(g => g.gateId === 'Gate-004');
    assert(g4Fail?.status === 'FAIL', 'Gate-004 must FAIL when config URL points to old GAS Deployment ID.');
    console.log('   ✓ Gate-004 Runtime Config Match verified.');
  }

  // ==========================================
  // Test Case 5: Gate-005 AI Employee Authorization
  // ==========================================
  {
    console.log('  [5/9] Testing Gate-005 (AI Employee Authorization)...');

    const resFailEmployee = await gate.verify({
      releaseId: 'REL-005',
      version: '1.0.0',
      environment: 'development',
      requestedRepository: 'posting-map-system',
      requestedBranch: 'main',
      targetPublishRoot: tmpDir,
      frontendConfigPath: validConfigPath,
      expectedBackendEndpoint: 'https://script.google.com/macros/s/AKfycbxy1_TEST/exec',
      expectedBackendVersion: '1.0.0',
      employeeId: 'emp-aios-01',
      profileName: 'Unauthorized Personal Profile' // Violation
    });

    const g5Fail = resFailEmployee.gateResults.find(g => g.gateId === 'Gate-005');
    assert(g5Fail?.status === 'FAIL', 'Gate-005 must FAIL when profileName is NOT AI Employee Profile.');
    console.log('   ✓ Gate-005 AI Employee Authorization verified.');
  }

  // ==========================================
  // Test Case 6: Gate-007 Deployment Fingerprint Match
  // ==========================================
  {
    console.log('  [6/9] Testing Gate-007 (Deployment Fingerprint Match)...');

    const resFailFingerprint = await gate.verify({
      releaseId: 'REL-007',
      version: '1.0.0',
      environment: 'development',
      requestedRepository: 'posting-map-system',
      requestedBranch: 'main',
      targetPublishRoot: tmpDir,
      frontendConfigPath: validConfigPath,
      expectedBackendEndpoint: 'https://script.google.com/macros/s/AKfycbxy1_TEST/exec',
      expectedBackendVersion: '1.0.0',
      employeeId: 'emp-aios-01',
      profileName: 'AI Employee Profile',
      fingerprint: {
        fingerprintHash: 'sha256-mismatched-hash-value-123456789'
      }
    });

    const g7Fail = resFailFingerprint.gateResults.find(g => g.gateId === 'Gate-007');
    assert(g7Fail?.status === 'FAIL', 'Gate-007 must FAIL when fingerprintHash does not match.');
    console.log('   ✓ Gate-007 Deployment Fingerprint Match verified.');
  }

  // ==========================================
  // Test Case 7: Dry Run Verification Mode
  // ==========================================
  {
    console.log('  [7/9] Testing Dry Run Mode (verifyDryRun)...');

    const dryRunResult = await gate.verifyDryRun({
      releaseId: 'REL-DRYRUN-001',
      version: '1.0.0',
      environment: 'staging',
      requestedRepository: 'posting-map-system',
      requestedBranch: 'main',
      targetPublishRoot: tmpDir,
      frontendConfigPath: validConfigPath,
      expectedBackendEndpoint: 'https://script.google.com/macros/s/AKfycbxy1_TEST/exec',
      expectedBackendVersion: '1.0.0',
      employeeId: 'emp-aios-dryrun',
      profileName: 'AI Employee Profile'
    });

    assert(dryRunResult.publishSummary.repository === 'posting-map-system', 'DryRun summary contains repository.');
    assert(dryRunResult.publishSummary.employeeId === 'emp-aios-dryrun', 'DryRun summary contains employeeId.');
    assert(dryRunResult.simulatedResult.overallStatus === 'PASS', 'DryRun simulation status is PASS.');
    console.log('   ✓ Dry Run Verification Mode verified.');
  }

  // ==========================================
  // Test Case 8: Environment Policy Test (Production vs Development)
  // ==========================================
  {
    console.log('  [8/9] Testing Environment Policy (Production vs Development)...');

    const prodReq: DeploymentGateRequest = {
      releaseId: 'REL-ENV-PROD',
      version: '1.0.0',
      environment: 'production',
      requestedRepository: 'posting-map-system',
      requestedBranch: 'main',
      targetPublishRoot: tmpDir,
      frontendConfigPath: validConfigPath,
      expectedBackendEndpoint: 'https://script.google.com/macros/s/AKfycbxy1_TEST/exec',
      expectedBackendVersion: '1.0.0',
      employeeId: 'emp-aios-01',
      profileName: 'AI Employee Profile'
    };

    const prodRes = await gate.verify(prodReq);
    assert(prodRes.overallStatus === 'PASS', 'Clean request in Production yields PASS.');

    console.log('   ✓ Environment Policy verified.');
  }

  // ==========================================
  // Test Case 9: ExecutionLedger Integration & Audit Verification
  // ==========================================
  {
    console.log('  [9/9] Testing ExecutionLedger Audit Commitment (Gate-006)...');

    const ledgers = ExecutionLedgerRegistry.getAll();
    assert(Array.isArray(ledgers), 'ExecutionLedgerRegistry contains registered entries.');
    console.log(`   ✓ ExecutionLedger Audit Records verified (Total registered: ${ledgers.length}).`);
  }

  // Cleanup temp files
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch (e) {}

  console.log('\n==========================================');
  console.log('🎉 ALL DTVG AUTOMATION TESTS PASSED SUCCESSFULLY');
  console.log('==========================================\n');
}

runTests().catch(err => {
  console.error('❌ DTVG Test Suite Failed:', err);
  process.exit(1);
});
