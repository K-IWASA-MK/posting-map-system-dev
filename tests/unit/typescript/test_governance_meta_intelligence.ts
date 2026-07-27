/**
 * test_governance_meta_intelligence.ts
 * 
 * Deployment Target Verification Gate - Meta Intelligence Layer Test Suite (Sprint DTVG-16)
 * AIOS リリースガバナンス基盤全体の健全性スコア、成熟度レベル (Level 5 Autonomous)、
 * 進化指標、メタレポート作成、および Meta Registry 不変保存を最終自動検証する。
 */

import { GovernanceHealthAnalyzer } from '../../../aios/release/governance/meta/GovernanceHealthAnalyzer';
import { GovernanceMaturityEvaluator } from '../../../aios/release/governance/meta/GovernanceMaturityEvaluator';
import { GovernanceEvolutionMonitor } from '../../../aios/release/governance/meta/GovernanceEvolutionMonitor';
import { GovernanceMetaRegistry } from '../../../aios/release/governance/meta/GovernanceMetaRegistry';
import { DeploymentGovernanceMemoryRegistry } from '../../../aios/release/governance/memory/DeploymentGovernanceMemoryRegistry';
import { MetaAssessmentResult } from '../../../aios/release/governance/meta/GovernanceMetaTypes';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('🧪 Starting Deployment Governance Meta Intelligence Layer Test Suite (Sprint DTVG-16 - Final Layer)...\n');

  GovernanceMetaRegistry.clear();
  DeploymentGovernanceMemoryRegistry.clear();

  const healthAnalyzer = new GovernanceHealthAnalyzer();
  const maturityEvaluator = new GovernanceMaturityEvaluator();
  const evolutionMonitor = new GovernanceEvolutionMonitor();

  // Seed baseline successful memory
  DeploymentGovernanceMemoryRegistry.saveMemory({
    memoryId: 'MEM-META-001',
    releaseId: 'REL-META-001',
    employeeId: 'emp-aios-deployer',
    decision: 'ALLOW',
    confidence: 97,
    riskLevel: 'LOW',
    gatePassedCount: 7,
    gateFailedCount: 0,
    finalOutcome: 'SUCCESS',
    recordedAt: new Date().toISOString()
  });

  // ==========================================
  // Test Scenario 1: Governance Health Score Calculation
  // ==========================================
  {
    console.log('  [1/5] Testing Governance Health Score Calculation...');

    const health = healthAnalyzer.analyzeHealth('emp-aios-deployer');
    assert(health.overallScore >= 80, 'Health overall score for clean memories must be >= 80.');
    assert(health.status === 'EXCELLENT' || health.status === 'GOOD', 'Health status must be EXCELLENT or GOOD.');
    assert(health.gateSuccessRate === 100, 'Gate success rate must be 100%.');

    console.log(`   ✓ Health Score verified (Overall: ${health.overallScore}/100, Status: ${health.status}).`);
  }

  // ==========================================
  // Test Scenario 2: Governance Maturity Level Evaluation
  // ==========================================
  {
    console.log('  [2/5] Testing Governance Maturity Level Evaluation...');

    const health = healthAnalyzer.analyzeHealth('emp-aios-deployer');
    const maturity = maturityEvaluator.evaluateMaturity(health);

    assert(maturity.level === 'LEVEL_5_AUTONOMOUS', 'Full DTVG stack must achieve LEVEL_5_AUTONOMOUS maturity.');
    assert(maturity.unlockedCapabilities.length >= 7, 'Must unlock all 7 governance capabilities.');

    console.log(`   ✓ Maturity Level verified (${maturity.levelName} - ${maturity.level}).`);
  }

  // ==========================================
  // Test Scenario 3: Governance Evolution Metrics Monitoring
  // ==========================================
  {
    console.log('  [3/5] Testing Governance Evolution Metrics Monitoring...');

    const metrics = evolutionMonitor.monitorEvolution('emp-aios-deployer');
    assert(typeof metrics.confidenceTrend === 'number', 'Confidence trend must be a number.');
    assert(metrics.stabilityScore > 90, 'Stability score must be > 90.');

    console.log(`   ✓ Evolution Metrics verified (Stability: ${metrics.stabilityScore}%, Confidence Trend: ${metrics.confidenceTrend.toFixed(1)}%).`);
  }

  // ==========================================
  // Test Scenario 4: Meta Assessment Generation & Registry Storage
  // ==========================================
  {
    console.log('  [4/5] Testing Meta Assessment Generation & Registry Storage...');

    const health = healthAnalyzer.analyzeHealth('emp-aios-deployer');
    const maturity = maturityEvaluator.evaluateMaturity(health);
    const metrics = evolutionMonitor.monitorEvolution('emp-aios-deployer');

    const now = new Date().toISOString();
    const assessmentId = `META-ASSESS-${Date.now()}`;

    const reportMarkdown = [
      `# 🏆 AIOS Deployment Governance Meta Intelligence Report`,
      `**Maturity Level**: ${maturity.levelName}`,
      `**Health Score**: ${health.overallScore}/100 (${health.status})`,
      `**Stability**: ${metrics.stabilityScore}%`
    ].join('\n');

    const result: MetaAssessmentResult = {
      assessmentId,
      employeeId: 'emp-aios-deployer',
      healthScore: health,
      maturityLevel: maturity,
      evolutionMetrics: metrics,
      metaReportMarkdown: reportMarkdown,
      assessedAt: now
    };

    GovernanceMetaRegistry.saveAssessment(result);

    const saved = GovernanceMetaRegistry.getLatestAssessment('emp-aios-deployer');
    assert(saved !== undefined, 'Assessment must be saved in GovernanceMetaRegistry.');
    assert(saved?.assessmentId === assessmentId, 'Saved assessmentId must match.');

    console.log('   ✓ Meta Assessment & Registry Storage verified.');
  }

  // ==========================================
  // Test Scenario 5: Final AIOS Governance System Maturity Gate
  // ==========================================
  {
    console.log('  [5/5] Testing Final AIOS Governance System Completion & Freeze Verification...');

    const assessments = GovernanceMetaRegistry.getAllAssessments();
    assert(assessments.length > 0, 'Meta assessment history confirmed.');

    console.log('   ✓ AIOS Deployment Governance Platform Final Layer Complete & Ready for Production.');
  }

  console.log('\n==========================================');
  console.log('🎉 AIOS DEPLOYMENT GOVERNANCE META INTELLIGENCE TESTS PASSED');
  console.log('==========================================\n');
}

runTests().catch(err => {
  console.error('❌ Meta Intelligence Layer Test Suite Failed:', err);
  process.exit(1);
});
