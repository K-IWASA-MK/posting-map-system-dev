/**
 * test_deployment_approval_intelligence.ts
 * 
 * Deployment Target Verification Gate - Approval Intelligence Test Suite (Sprint DTVG-11)
 * デプロイ評価決定 (ALLOW / DENY / REQUIRE_REVIEW)、判断根拠、エビデンス参照、
 * Confidence 算出、および説明 Markdown レポート生成を自動検証する。
 */

import { DeploymentApprovalIntelligence } from '../../../aios/release/approval/DeploymentApprovalIntelligence';
import { DeploymentGateRequest } from '../../../aios/release/gates/types/DeploymentTargetGateTypes';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('🧪 Starting Autonomous Deployment Approval Intelligence Test Suite (Sprint DTVG-11)...\n');

  const intelligence = new DeploymentApprovalIntelligence();

  // ==========================================
  // Test Scenario 1: Clean Release (ALLOW)
  // ==========================================
  {
    console.log('  [1/4] Testing Clean Release Assessment (ALLOW)...');

    const cleanReq: DeploymentGateRequest = {
      releaseId: 'REL-ALLOW-001',
      version: '1.0.0',
      environment: 'production',
      requestedRepository: 'posting-map-system',
      requestedBranch: 'main',
      targetPublishRoot: '/projects/posting-map/active/dashboard',
      frontendConfigPath: '/projects/posting-map/active/dashboard/config.js',
      expectedBackendEndpoint: 'https://script.google.com/macros/s/AKfycbxy1_VALID/exec',
      expectedBackendVersion: '1.0.0',
      employeeId: 'emp-aios-01',
      profileName: 'AI Employee Profile'
    };

    const report = intelligence.evaluate(cleanReq);
    assert(report.decision === 'ALLOW', 'Clean request must result in ALLOW decision.');
    assert(report.confidence >= 90, 'Confidence for clean ALLOW decision must be >= 90%.');
    assert(report.reasons.length > 0, 'Report must include decision reasons.');
    assert(report.explanationMarkdown.includes('ALLOW (デプロイ許可)'), 'Explanation Markdown must include ALLOW badge.');

    console.log('   ✓ Clean Release Assessment (ALLOW) verified.');
  }

  // ==========================================
  // Test Scenario 2: Moderate Risk Release (REQUIRE_REVIEW)
  // ==========================================
  {
    console.log('  [2/4] Testing Moderate Risk Assessment (REQUIRE_REVIEW)...');

    const modReq: DeploymentGateRequest = {
      releaseId: 'REL-REV-002',
      version: '1.0.0',
      environment: 'production',
      requestedRepository: 'posting-map-system',
      requestedBranch: 'main',
      targetPublishRoot: '/projects/posting-map/active/dashboard',
      frontendConfigPath: '/other-directory/config.js', // Publish root discrepancy
      expectedBackendEndpoint: 'https://script.google.com/macros/s/AKfycbxy1_VALID/exec',
      expectedBackendVersion: '1.0.0',
      employeeId: 'emp-aios-01',
      profileName: 'AI Employee Profile'
    };

    const report = intelligence.evaluate(modReq);
    assert(report.decision === 'REQUIRE_REVIEW', 'Moderate risk request must result in REQUIRE_REVIEW decision.');
    assert(report.reasons.some(r => r.category === 'PUBLISH_ROOT'), 'Reasons must specify Publish Root category.');
    assert(report.evidences.some(e => e.gateOrPatternId === 'PAT-ROOT-003'), 'Evidence must cite PAT-ROOT-003 pattern.');

    console.log('   ✓ Moderate Risk Assessment (REQUIRE_REVIEW) verified.');
  }

  // ==========================================
  // Test Scenario 3: High/Critical Risk Release (DENY)
  // ==========================================
  {
    console.log('  [3/4] Testing High Risk Release Assessment (DENY)...');

    const denyReq: DeploymentGateRequest = {
      releaseId: 'REL-DENY-003',
      version: '1.0.0',
      environment: 'production',
      requestedRepository: 'wrong-repo', // Repo mismatch
      requestedBranch: 'main',
      targetPublishRoot: '/projects/posting-map/active/dashboard',
      frontendConfigPath: '/outside/config.js', // Publish root mismatch
      expectedBackendEndpoint: 'https://script.google.com/macros/s/OLD_STALE_DEPLOYMENT_ID/exec', // Stale GAS ID
      expectedBackendVersion: '1.0.0',
      employeeId: 'emp-aios-01',
      profileName: 'AI Employee Profile'
    };

    const report = intelligence.evaluate(denyReq);
    assert(report.decision === 'DENY', 'High/Critical risk request must result in DENY decision.');
    assert(report.confidence >= 90, 'Confidence for DENY decision must be high.');
    assert(report.evidences.some(e => e.gateOrPatternId === 'PAT-CONFIG-004'), 'Evidence must cite PAT-CONFIG-004.');
    assert(report.explanationMarkdown.includes('DENY (デプロイ停止推奨)'), 'Explanation must include DENY badge.');

    console.log('   ✓ High Risk Release Assessment (DENY) verified.');
  }

  // ==========================================
  // Test Scenario 4: Explanation Markdown Structure
  // ==========================================
  {
    console.log('  [4/4] Testing Explanation Markdown Structure & Formatting...');

    const req: DeploymentGateRequest = {
      releaseId: 'REL-EXP-004',
      version: '1.0.0',
      environment: 'production',
      requestedRepository: 'posting-map-system',
      requestedBranch: 'main',
      targetPublishRoot: '/projects/posting-map/active/dashboard',
      frontendConfigPath: '/projects/posting-map/active/dashboard/config.js',
      expectedBackendEndpoint: 'https://script.google.com/macros/s/AKfycbxy1_VALID/exec',
      expectedBackendVersion: '1.0.0',
      employeeId: 'emp-aios-01',
      profileName: 'AI Employee Profile'
    };

    const report = intelligence.evaluate(req);
    const md = report.explanationMarkdown;

    assert(md.includes('AI Employee Deployment Assessment Report'), 'Must contain header title.');
    assert(md.includes('Key Decision Reasons'), 'Must contain Key Decision Reasons section.');
    assert(md.includes('Audit Evidence References'), 'Must contain Audit Evidence References section.');
    assert(md.includes('Action Guidance'), 'Must contain Action Guidance section.');

    console.log('   ✓ Explanation Markdown Structure verified.');
  }

  console.log('\n==========================================');
  console.log('🎉 AUTONOMOUS DEPLOYMENT APPROVAL INTELLIGENCE TESTS PASSED');
  console.log('==========================================\n');
}

runTests().catch(err => {
  console.error('❌ Approval Intelligence Test Suite Failed:', err);
  process.exit(1);
});
