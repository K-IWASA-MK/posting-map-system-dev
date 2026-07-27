/**
 * test_deployment_feedback_loop.ts
 * 
 * Deployment Target Verification Gate - AI Employee Feedback Loop Suite (Sprint DTVG-09)
 * ExecutionLedger のガバナンス記録から失敗パターン抽出、改善勧告生成、ナレッジレジストリ登録を検証する。
 */

import { ExecutionLedgerRegistry, ExecutionState } from '../../../sdk/ExecutionLedgerRegistry';
import { DeploymentFeedbackAnalyzer } from '../../../aios/release/feedback/DeploymentFeedbackAnalyzer';
import { DeploymentKnowledgeRegistry } from '../../../aios/release/feedback/DeploymentKnowledgeRegistry';
import { CapabilityRegistry, CapabilityCategory, CapabilityStatus } from '../../../sdk/CapabilityRegistry';
import { SkillPipelineRegistry, SkillPipelineStatus } from '../../../sdk/SkillPipelineRegistry';
import { SkillRegistry, SkillCategory, SkillStatus } from '../../../sdk/SkillRegistry';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

function ensureSSOT(): void {
  const capId = "cap-deployment-gate";
  const pipeId = "pipe-release-verification";
  const skillId = "skill-deployment-target-verification";

  if (!CapabilityRegistry.get(capId)) {
    try {
      CapabilityRegistry.register({
        capabilityId: capId,
        capabilityName: "Deployment Target Verification",
        category: CapabilityCategory.Release,
        description: "Capability for verifying deployment targets",
        priority: 1,
        status: CapabilityStatus.ACTIVE,
        version: "1.0.0",
        supportedSkillIds: [skillId]
      });
    } catch (e) {}
  }

  if (!SkillRegistry.get(skillId)) {
    try {
      SkillRegistry.register({
        skillId: skillId,
        skillName: "Deployment Target Verification Skill",
        category: SkillCategory.Audit,
        description: "Skill to verify deployment target integrity",
        capabilityId: capId,
        priority: 1,
        version: "1.0.0",
        status: SkillStatus.ACTIVE
      });
    } catch (e) {}
  }

  if (!SkillPipelineRegistry.get(pipeId)) {
    try {
      const now = new Date().toISOString();
      SkillPipelineRegistry.register({
        pipelineId: pipeId,
        pipelineName: "Release Verification Pipeline",
        capabilityId: capId,
        description: "Pipeline for release verification",
        skillIds: [skillId],
        priority: 1,
        status: SkillPipelineStatus.ACTIVE,
        version: "1.0.0",
        pipelineVersion: "1.0.0",
        createdAt: now,
        updatedAt: now
      });
    } catch (e) {}
  }
}

async function runTests() {
  console.log('🧪 Starting AI Employee Deployment Feedback Loop Automation Suite (Sprint DTVG-09)...\n');

  ensureSSOT();
  DeploymentKnowledgeRegistry.clear();
  DeploymentKnowledgeRegistry.initializeDefaults();

  const analyzer = new DeploymentFeedbackAnalyzer();

  // Mock Ledger Entries
  const timestamp = new Date().toISOString();

  // Entry 1: Gate-004 Runtime Config Mismatch Failure
  ExecutionLedgerRegistry.register({
    executionId: `ledger-${Date.now()}1`,
    ledgerVersion: '1.0.0',
    description: 'Deployment Gate Assessment - Config Mismatch',
    capabilityId: 'cap-deployment-gate',
    pipelineId: 'pipe-release-verification',
    skillIds: ['skill-deployment-target-verification'],
    executionState: ExecutionState.FAILED,
    timestamp,
    version: '1.0.0',
    createdAt: timestamp,
    updatedAt: timestamp,
    auditTrail: [
      'ReleaseId: REL-MOCK-CONFIG-FAIL',
      'OverallStatus: FAIL',
      'Gate-004 (Runtime Config Match): FAIL - Stale endpoint detected (old GAS ID)'
    ]
  });

  // Entry 2: Gate-008 Post-Deployment Smoke Test Failure
  ExecutionLedgerRegistry.register({
    executionId: `ledger-${Date.now()}2`,
    ledgerVersion: '1.0.0',
    description: 'Deployment Gate Assessment - Smoke Test Failure',
    capabilityId: 'cap-deployment-gate',
    pipelineId: 'pipe-release-verification',
    skillIds: ['skill-deployment-target-verification'],
    executionState: ExecutionState.FAILED,
    timestamp,
    version: '1.0.0',
    createdAt: timestamp,
    updatedAt: timestamp,
    auditTrail: [
      'Gate: Gate-008 (Deployment Smoke Test)',
      'ReleaseId: REL-MOCK-SMOKE-FAIL',
      'OverallStatus: FAIL',
      'Test-003 (Runtime Config Check): FAIL - Public asset points to OLD_ID'
    ]
  });

  // ==========================================
  // Test Scenario 1: Failure Pattern Extraction
  // ==========================================
  {
    console.log('  [1/4] Testing Failure Pattern Extraction from Ledger...');

    const feedback = analyzer.analyzeAllLedgers('emp-aios-deployer');
    assert(feedback.totalDeployments >= 2, 'Should analyze registered ledger entries.');
    assert(feedback.failedDeployments >= 2, 'Should identify failed deployment records.');

    assert(feedback.topFailurePatterns.length >= 1, 'Should extract top failure patterns.');
    const configPattern = feedback.topFailurePatterns.find(p => p.pattern.category === 'RUNTIME_CONFIG_MISMATCH');
    assert(configPattern !== undefined, 'Should detect RUNTIME_CONFIG_MISMATCH pattern.');

    console.log('   ✓ Failure Pattern Extraction verified.');
  }

  // ==========================================
  // Test Scenario 2: Improvement Recommendation Generation
  // ==========================================
  {
    console.log('  [2/4] Testing Improvement Recommendation Generation...');

    const feedback = analyzer.analyzeAllLedgers('emp-aios-deployer');
    const recentRecords = feedback.recentLearningRecords;

    assert(recentRecords.length >= 2, 'Learning records should be generated.');
    const hasRecommendations = recentRecords.some(r => r.recommendations.length > 0);
    assert(hasRecommendations, 'Should generate actionable recommendations for failed gates.');

    const rec = recentRecords.flatMap(r => r.recommendations).find(r => r.category === 'RUNTIME_CONFIG_MISMATCH');
    assert(Boolean(rec && rec.severity === 'CRITICAL'), 'Runtime config mismatch recommendation severity must be CRITICAL.');
    assert(Boolean(rec && rec.actionableAdvice.includes('Synchronize config.js')), 'Recommendation must contain actionable advice.');

    console.log('   ✓ Improvement Recommendation Generation verified.');
  }

  // ==========================================
  // Test Scenario 3: Deployment Knowledge Registry Integration
  // ==========================================
  {
    console.log('  [3/4] Testing Deployment Knowledge Registry Integration...');

    const patterns = DeploymentKnowledgeRegistry.getAllPatterns();
    assert(patterns.length >= 7, 'Knowledge Registry should contain predefined failure patterns.');

    const pat004 = DeploymentKnowledgeRegistry.getPattern('PAT-CONFIG-004');
    assert(Boolean(pat004 && pat004.targetGate === 'Gate-004'), 'Pattern PAT-CONFIG-004 must map to Gate-004.');
    assert(Boolean(pat004 && pat004.prevention.length > 0), 'Pattern must define prevention guidance.');

    console.log('   ✓ Deployment Knowledge Registry Integration verified.');
  }

  // ==========================================
  // Test Scenario 4: AI Employee Feedback Summary Calculation
  // ==========================================
  {
    console.log('  [4/4] Testing AI Employee Feedback Summary Calculation...');

    const summary = analyzer.analyzeAllLedgers('emp-aios-deployer');
    assert(typeof summary.successRate === 'number', 'Success rate should be a calculated number.');
    assert(summary.employeeId === 'emp-aios-deployer', 'Feedback summary reflects target employeeId.');

    console.log(`   ✓ Feedback Summary calculated (Success Rate: ${summary.successRate.toFixed(1)}%).`);
  }

  console.log('\n==========================================');
  console.log('🎉 AI EMPLOYEE DEPLOYMENT FEEDBACK LOOP TESTS PASSED');
  console.log('==========================================\n');
}

runTests().catch(err => {
  console.error('❌ Feedback Loop Automation Test Failed:', err);
  process.exit(1);
});
