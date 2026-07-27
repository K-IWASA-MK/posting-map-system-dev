/**
 * test_deployment_governance_agent.ts
 * 
 * Deployment Target Verification Gate - Governance Agent Test Suite (Sprint DTVG-12)
 * DTVG-01〜11 統括オーケストレーター Agent の実行パイプライン、評価判定、
 * リスク予測、改善案生成、レポート自動作成、および Ledger 不変記録を自動検証する。
 */

import { DeploymentGovernanceAgent } from '../../../aios/release/governance/DeploymentGovernanceAgent';
import { DeploymentGateRequest } from '../../../aios/release/gates/types/DeploymentTargetGateTypes';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('🧪 Starting Autonomous Deployment Governance Agent Automation Test Suite (Sprint DTVG-12)...\n');

  const agent = new DeploymentGovernanceAgent(process.cwd());

  // ==========================================
  // Test Scenario 1: Clean Deployment Governance Pipeline (ALLOW)
  // ==========================================
  {
    console.log('  [1/4] Testing Clean Deployment Governance Agent Pipeline (ALLOW)...');

    const cleanReq: DeploymentGateRequest = {
      releaseId: 'REL-AGENT-001',
      version: '1.0.0',
      environment: 'production',
      requestedRepository: 'posting-map-system',
      requestedBranch: 'main',
      targetPublishRoot: process.cwd(),
      frontendConfigPath: 'projects/posting-map/active/dashboard/config.js',
      expectedBackendEndpoint: 'https://script.google.com/macros/s/AKfycbxy1_VALID/exec',
      expectedBackendVersion: '1.0.0',
      employeeId: 'emp-aios-deployer',
      profileName: 'AI Employee Profile'
    };

    const result = await agent.execute({
      gateRequest: cleanReq,
      runDryRun: false
    });

    assert(result.agentStatus === 'COMPLETED', 'Agent status must be COMPLETED.');
    assert(result.report.overallDecision === 'ALLOW', 'Overall decision must be ALLOW.');
    assert(result.report.confidence >= 90, 'Confidence must be >= 90%.');
    assert(result.report.stageResults.length === 5, 'Must record all 5 execution stages (INITIALIZING, VERIFYING, ANALYZING, EVALUATING, REPORTING).');
    assert(Boolean(result.executionLedgerId), 'Must record execution to ExecutionLedger.');

    console.log('   ✓ Clean Deployment Governance Agent Pipeline verified.');
  }

  // ==========================================
  // Test Scenario 2: Dry Run Mode Pipeline
  // ==========================================
  {
    console.log('  [2/4] Testing Dry Run Mode Governance Pipeline...');

    const dryRunReq: DeploymentGateRequest = {
      releaseId: 'REL-AGENT-DRY-002',
      version: '1.0.0',
      environment: 'production',
      requestedRepository: 'posting-map-system',
      requestedBranch: 'main',
      targetPublishRoot: process.cwd(),
      frontendConfigPath: 'projects/posting-map/active/dashboard/config.js',
      expectedBackendEndpoint: 'https://script.google.com/macros/s/AKfycbxy1_VALID/exec',
      expectedBackendVersion: '1.0.0',
      employeeId: 'emp-aios-deployer',
      profileName: 'AI Employee Profile'
    };

    const result = await agent.execute({
      gateRequest: dryRunReq,
      runDryRun: true
    });

    assert(result.agentStatus === 'COMPLETED', 'Dry run agent status must be COMPLETED.');
    assert(result.report.gateSummary.totalGates > 0, 'Dry run must evaluate gate summary.');

    console.log('   ✓ Dry Run Mode Governance Pipeline verified.');
  }

  // ==========================================
  // Test Scenario 3: High Risk / Stale Endpoint Pipeline (DENY / REQUIRE_REVIEW)
  // ==========================================
  {
    console.log('  [3/4] Testing High Risk Stale Endpoint Governance Pipeline (DENY/REQUIRE_REVIEW)...');

    const highRiskReq: DeploymentGateRequest = {
      releaseId: 'REL-AGENT-RISK-003',
      version: '1.0.0',
      environment: 'production',
      requestedRepository: 'wrong-repo-identity',
      requestedBranch: 'main',
      targetPublishRoot: process.cwd(),
      frontendConfigPath: 'projects/posting-map/active/dashboard/config.js',
      expectedBackendEndpoint: 'https://script.google.com/macros/s/OLD_STALE_DEPLOYMENT_ID/exec',
      expectedBackendVersion: '1.0.0',
      employeeId: 'emp-aios-deployer',
      profileName: 'AI Employee Profile'
    };

    const result = await agent.execute({
      gateRequest: highRiskReq,
      runDryRun: false
    });

    assert(result.report.overallDecision === 'DENY' || result.report.overallDecision === 'REQUIRE_REVIEW', 'High risk request must yield DENY or REQUIRE_REVIEW.');
    assert(result.report.riskLevel === 'HIGH' || result.report.riskLevel === 'CRITICAL', 'Risk level must be HIGH or CRITICAL.');

    console.log('   ✓ High Risk Stale Endpoint Governance Pipeline verified.');
  }

  // ==========================================
  // Test Scenario 4: Final Governance Report Format
  // ==========================================
  {
    console.log('  [4/4] Testing Final Governance Report Formatting & Sections...');

    const req: DeploymentGateRequest = {
      releaseId: 'REL-AGENT-RPT-004',
      version: '1.0.0',
      environment: 'production',
      requestedRepository: 'posting-map-system',
      requestedBranch: 'main',
      targetPublishRoot: process.cwd(),
      frontendConfigPath: 'projects/posting-map/active/dashboard/config.js',
      expectedBackendEndpoint: 'https://script.google.com/macros/s/AKfycbxy1_VALID/exec',
      expectedBackendVersion: '1.0.0',
      employeeId: 'emp-aios-deployer',
      profileName: 'AI Employee Profile'
    };

    const result = await agent.execute({ gateRequest: req });
    const md = result.report.reportMarkdown;

    assert(md.includes('AI Employee Deployment Governance Report'), 'Report must contain main header.');
    assert(md.includes('Gate Check Summary'), 'Report must contain Gate Check Summary section.');
    assert(md.includes('Execution Stage Pipeline Results'), 'Report must contain Pipeline Results section.');
    assert(md.includes('Autonomous Preventive Recommendations'), 'Report must contain Preventive Recommendations section.');

    console.log('   ✓ Final Governance Report Formatting verified.');
  }

  console.log('\n==========================================');
  console.log('🎉 AUTONOMOUS DEPLOYMENT GOVERNANCE AGENT TESTS PASSED');
  console.log('==========================================\n');
}

runTests().catch(err => {
  console.error('❌ Governance Agent Test Suite Failed:', err);
  process.exit(1);
});
