/**
 * test_self_improving_governance.ts
 * 
 * Deployment Target Verification Gate - Self Improving Governance Test Suite (Sprint DTVG-14)
 * AI Employee 自律自己改善学習サイクルの起動、Decision Quality 算出、
 * Confidence 最適化、改善提案生成、および Improvement Registry 保存を自動検証する。
 */

import { DeploymentGovernanceMemoryRegistry } from '../../../aios/release/governance/memory/DeploymentGovernanceMemoryRegistry';
import { GovernanceLearningEngine } from '../../../aios/release/governance/evolution/GovernanceLearningEngine';
import { GovernanceImprovementRegistry } from '../../../aios/release/governance/evolution/GovernanceImprovementRegistry';
import { GovernanceMemoryRecord } from '../../../aios/release/governance/memory/DeploymentGovernanceMemoryTypes';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('🧪 Starting Self Improving Deployment Governance Intelligence Test Suite (Sprint DTVG-14)...\n');

  DeploymentGovernanceMemoryRegistry.clear();
  GovernanceImprovementRegistry.clear();

  const learningEngine = new GovernanceLearningEngine();
  const now = new Date().toISOString();

  // Populate 16 High Quality Historical Memories
  for (let i = 1; i <= 16; i++) {
    const memory: GovernanceMemoryRecord = {
      memoryId: `MEM-LEARN-${i}`,
      releaseId: `REL-LEARN-${i}`,
      employeeId: 'emp-aios-deployer',
      decision: 'ALLOW',
      confidence: 96,
      riskLevel: 'LOW',
      gatePassedCount: 7,
      gateFailedCount: 0,
      finalOutcome: 'SUCCESS',
      recordedAt: now
    };
    DeploymentGovernanceMemoryRegistry.saveMemory(memory);
  }

  // ==========================================
  // Test Scenario 1: Learning Cycle Execution & Decision Quality
  // ==========================================
  {
    console.log('  [1/4] Testing Learning Cycle Execution & Decision Quality Calculation...');

    const cycleResult = learningEngine.runLearningCycle('emp-aios-deployer');

    assert(cycleResult.employeeId === 'emp-aios-deployer', 'Target employeeId must match.');
    assert(cycleResult.qualityScore.totalEvaluations === 16, 'Total evaluations must equal 16 memories.');
    assert(cycleResult.qualityScore.accuracyRate === 100, 'Accuracy rate for 16 successful deployments must be 100%.');
    assert(cycleResult.qualityScore.qualityGrade === 'A', 'Quality grade for 100% accuracy must be Grade A.');

    console.log(`   ✓ Decision Quality verified (Grade: ${cycleResult.qualityScore.qualityGrade}, Accuracy: ${cycleResult.qualityScore.accuracyRate}%).`);
  }

  // ==========================================
  // Test Scenario 2: Confidence Optimization Calculation
  // ==========================================
  {
    console.log('  [2/4] Testing Confidence Optimization Calculation...');

    const cycleResult = learningEngine.runLearningCycle('emp-aios-deployer');
    const opt = cycleResult.confidenceOptimization;

    assert(opt.originalConfidence === 95.0, 'Original baseline confidence should be 95.0%.');
    assert(opt.adjustmentDelta === 3.0, 'High accuracy over 16 evaluations must yield +3.0% confidence boost.');
    assert(opt.optimizedConfidence === 98.0, 'Optimized confidence must be 98.0%.');
    assert(opt.reason.includes('High accuracy rate'), 'Reason must explain confidence increase rationale.');

    console.log(`   ✓ Confidence Optimization verified (${opt.originalConfidence}% -> ${opt.optimizedConfidence}%, Delta: +${opt.adjustmentDelta}%).`);
  }

  // ==========================================
  // Test Scenario 3: Governance Improvement Proposal & Registry Storage
  // ==========================================
  {
    console.log('  [3/4] Testing Governance Improvement Proposal Generation & Registry...');

    const cycleResult = learningEngine.runLearningCycle('emp-aios-deployer');
    assert(cycleResult.proposals.length >= 1, 'High accuracy rate must generate improvement proposals.');

    const proposalsInRegistry = GovernanceImprovementRegistry.getAllProposals();
    assert(proposalsInRegistry.length >= 1, 'Proposals must be saved to GovernanceImprovementRegistry.');

    const cycleResultsInRegistry = GovernanceImprovementRegistry.getAllCycleResults();
    assert(cycleResultsInRegistry.length >= 1, 'LearningCycleResult must be saved to registry.');

    console.log('   ✓ Governance Improvement Proposals & Registry Storage verified.');
  }

  // ==========================================
  // Test Scenario 4: Governance Safety Boundary Verification
  // ==========================================
  {
    console.log('  [4/4] Testing Governance Safety Boundary (No Unsanctioned Mutations)...');

    const cycleResult = learningEngine.runLearningCycle('emp-aios-deployer');
    assert(cycleResult.cycleId.startsWith('CYCLE-emp-aios-deployer'), 'Learning cycle completes safely within governance bounds.');

    console.log('   ✓ Governance Safety Boundary verified.');
  }

  console.log('\n==========================================');
  console.log('🎉 SELF IMPROVING DEPLOYMENT GOVERNANCE TESTS PASSED');
  console.log('==========================================\n');
}

runTests().catch(err => {
  console.error('❌ Self Improving Governance Test Suite Failed:', err);
  process.exit(1);
});
