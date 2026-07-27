/**
 * test_deployment_governance_memory.ts
 * 
 * Deployment Target Verification Gate - Memory & Evolution Layer Test Suite (Sprint DTVG-13)
 * ガバナンス判断長期記憶の保持・検索、経験分析、および AI Employee 進化スナップショットの生成を自動検証する。
 */

import { DeploymentGovernanceMemoryRegistry } from '../../../aios/release/governance/memory/DeploymentGovernanceMemoryRegistry';
import { GovernanceMemoryAnalyzer } from '../../../aios/release/governance/memory/GovernanceMemoryAnalyzer';
import { GovernanceEvolutionEngine } from '../../../aios/release/governance/memory/GovernanceEvolutionEngine';
import { GovernanceMemoryRecord } from '../../../aios/release/governance/memory/DeploymentGovernanceMemoryTypes';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('🧪 Starting Deployment Governance Memory & Evolution Layer Test Suite (Sprint DTVG-13)...\n');

  DeploymentGovernanceMemoryRegistry.clear();
  const analyzer = new GovernanceMemoryAnalyzer();
  const evolutionEngine = new GovernanceEvolutionEngine();

  // Mock Memories Setup
  const now = new Date().toISOString();
  const mockMemories: GovernanceMemoryRecord[] = [
    {
      memoryId: 'MEM-001',
      releaseId: 'REL-MEM-101',
      employeeId: 'emp-aios-01',
      decision: 'ALLOW',
      confidence: 96,
      riskLevel: 'LOW',
      gatePassedCount: 7,
      gateFailedCount: 0,
      finalOutcome: 'SUCCESS',
      recordedAt: now
    },
    {
      memoryId: 'MEM-002',
      releaseId: 'REL-MEM-102',
      employeeId: 'emp-aios-01',
      decision: 'ALLOW',
      confidence: 95,
      riskLevel: 'LOW',
      gatePassedCount: 7,
      gateFailedCount: 0,
      finalOutcome: 'SUCCESS',
      recordedAt: now
    },
    {
      memoryId: 'MEM-003',
      releaseId: 'REL-MEM-103',
      employeeId: 'emp-aios-01',
      decision: 'REQUIRE_REVIEW',
      confidence: 90,
      riskLevel: 'HIGH',
      gatePassedCount: 6,
      gateFailedCount: 1,
      humanReviewResult: 'APPROVED',
      finalOutcome: 'SUCCESS',
      recordedAt: now
    }
  ];

  for (const m of mockMemories) {
    DeploymentGovernanceMemoryRegistry.saveMemory(m);
  }

  // ==========================================
  // Test Scenario 1: Memory Record Storage & Querying
  // ==========================================
  {
    console.log('  [1/4] Testing Memory Record Storage & Querying...');

    const all = DeploymentGovernanceMemoryRegistry.getAllMemories();
    assert(all.length === 3, 'Should store 3 memory records.');

    const queried = DeploymentGovernanceMemoryRegistry.queryMemories({
      employeeId: 'emp-aios-01',
      decision: 'ALLOW'
    });
    assert(queried.length === 2, 'Query by employeeId and decision ALLOW should return 2 records.');

    console.log('   ✓ Memory Record Storage & Querying verified.');
  }

  // ==========================================
  // Test Scenario 2: Governance Experience Analysis
  // ==========================================
  {
    console.log('  [2/4] Testing Governance Experience Analysis...');

    const exp = analyzer.analyzeExperience('emp-aios-01');
    assert(exp.totalMemories === 3, 'Total memories analyzed must be 3.');
    assert(exp.successfulOutcomeRate === 100, 'Successful outcome rate must be 100%.');
    assert(exp.learnedPatterns.length >= 7, 'Must map learned patterns from knowledge base.');

    console.log('   ✓ Governance Experience Analysis verified.');
  }

  // ==========================================
  // Test Scenario 3: Governance Evolution Snapshot Generation
  // ==========================================
  {
    console.log('  [3/4] Testing Governance Evolution Snapshot Generation...');

    const snapshot = evolutionEngine.generateSnapshot('emp-aios-01');
    assert(snapshot.employeeId === 'emp-aios-01', 'Snapshot target employeeId must match.');
    assert(snapshot.governanceSkillLevel === 'INTERMEDIATE', 'Skill level with 3 successful memories must be INTERMEDIATE.');
    assert(snapshot.confidenceAdjustment > 0, 'Confidence adjustment for good outcome rate must be positive.');
    assert(snapshot.evolutionInsights.length > 0, 'Must generate evolution insights.');

    console.log(`   ✓ Evolution Snapshot verified (Skill Level: ${snapshot.governanceSkillLevel}, Adjustment: +${snapshot.confidenceAdjustment}).`);
  }

  // ==========================================
  // Test Scenario 4: Master Skill Evolution
  // ==========================================
  {
    console.log('  [4/4] Testing Master Skill Evolution Transition...');

    // Add 18 more successful memories to reach 21 total
    for (let i = 4; i <= 21; i++) {
      DeploymentGovernanceMemoryRegistry.saveMemory({
        memoryId: `MEM-0${i}`,
        releaseId: `REL-MEM-${i}`,
        employeeId: 'emp-aios-01',
        decision: 'ALLOW',
        confidence: 97,
        riskLevel: 'LOW',
        gatePassedCount: 7,
        gateFailedCount: 0,
        finalOutcome: 'SUCCESS',
        recordedAt: now
      });
    }

    const masterSnapshot = evolutionEngine.generateSnapshot('emp-aios-01');
    assert(masterSnapshot.governanceSkillLevel === 'MASTER', 'Skill level with 21 successful memories must reach MASTER.');
    assert(masterSnapshot.confidenceAdjustment === 0.05, 'Master confidence adjustment must be +0.05.');

    console.log('   ✓ Master Skill Evolution Transition verified.');
  }

  console.log('\n==========================================');
  console.log('🎉 DEPLOYMENT GOVERNANCE MEMORY & EVOLUTION TESTS PASSED');
  console.log('==========================================\n');
}

runTests().catch(err => {
  console.error('❌ Memory & Evolution Test Suite Failed:', err);
  process.exit(1);
});
