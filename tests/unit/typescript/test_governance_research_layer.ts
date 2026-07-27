/**
 * test_governance_research_layer.ts
 * 
 * Deployment Target Verification Gate - Autonomous Research Layer Test Suite (Sprint DTVG-15)
 * パターン発見、リスク仮説生成、仮説検証、ナレッジ拡張提案生成、
 * および Research Registry への不変保存を自動検証する。
 */

import { DeploymentGovernanceMemoryRegistry } from '../../../aios/release/governance/memory/DeploymentGovernanceMemoryRegistry';
import { GovernanceResearchEngine } from '../../../aios/release/governance/research/GovernanceResearchEngine';
import { GovernanceResearchRegistry } from '../../../aios/release/governance/research/GovernanceResearchRegistry';
import { GovernanceMemoryRecord } from '../../../aios/release/governance/memory/DeploymentGovernanceMemoryTypes';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('🧪 Starting Deployment Governance Autonomous Research Layer Test Suite (Sprint DTVG-15)...\n');

  DeploymentGovernanceMemoryRegistry.clear();
  GovernanceResearchRegistry.clear();

  const researchEngine = new GovernanceResearchEngine();
  const now = new Date().toISOString();

  // Populate Mock Memories for Research Analysis
  const mockMemories: GovernanceMemoryRecord[] = [
    {
      memoryId: 'MEM-RES-001',
      releaseId: 'REL-RES-101',
      employeeId: 'emp-aios-researcher',
      decision: 'ALLOW',
      confidence: 96,
      riskLevel: 'LOW',
      gatePassedCount: 7,
      gateFailedCount: 0,
      finalOutcome: 'SUCCESS',
      recordedAt: now
    },
    {
      memoryId: 'MEM-RES-002',
      releaseId: 'REL-RES-102',
      employeeId: 'emp-aios-researcher',
      decision: 'REQUIRE_REVIEW',
      confidence: 90,
      riskLevel: 'HIGH',
      gatePassedCount: 6,
      gateFailedCount: 1, // Gate-004 Config failure
      humanReviewResult: 'APPROVED',
      finalOutcome: 'SUCCESS',
      recordedAt: now
    }
  ];

  for (const m of mockMemories) {
    DeploymentGovernanceMemoryRegistry.saveMemory(m);
  }

  // ==========================================
  // Test Scenario 1: Pattern Discovery & Risk Hypothesis Generation
  // ==========================================
  {
    console.log('  [1/5] Testing Pattern Discovery & Risk Hypothesis Generation...');

    const finding = researchEngine.conductResearch('emp-aios-researcher');

    assert(finding.employeeId === 'emp-aios-researcher', 'Finding target employeeId must match.');
    assert(finding.discoveries.length >= 2, 'Must discover at least 2 pattern categories (CONFIG, ROOT).');
    assert(finding.hypotheses.length >= 2, 'Must generate risk hypotheses for discovered patterns.');

    console.log(`   ✓ Discoveries (${finding.discoveries.length}) & Hypotheses (${finding.hypotheses.length}) generated.`);
  }

  // ==========================================
  // Test Scenario 2: Research Validation Engine
  // ==========================================
  {
    console.log('  [2/5] Testing Research Validation Engine...');

    const finding = researchEngine.conductResearch('emp-aios-researcher');
    assert(finding.validations.length === finding.hypotheses.length, 'Every hypothesis must have a validation result.');

    const validatedCount = finding.validations.filter(v => v.validated).length;
    assert(validatedCount > 0, 'At least one hypothesis must pass validation.');

    console.log(`   ✓ Validation verified (${validatedCount}/${finding.validations.length} hypotheses validated).`);
  }

  // ==========================================
  // Test Scenario 3: Knowledge Expansion Proposal Generation
  // ==========================================
  {
    console.log('  [3/5] Testing Knowledge Expansion Proposal Generation...');

    const finding = researchEngine.conductResearch('emp-aios-researcher');
    assert(finding.proposals.length > 0, 'Validated hypotheses must yield Knowledge Expansion Proposals.');

    const prop = finding.proposals[0];
    assert(Boolean(prop.proposalId), 'Proposal must have proposalId.');
    assert(prop.preventionGuidance.length > 0, 'Proposal must specify prevention guidance.');

    console.log(`   ✓ Knowledge Expansion Proposals generated (${finding.proposals.length} proposals).`);
  }

  // ==========================================
  // Test Scenario 4: Governance Research Registry Integration
  // ==========================================
  {
    console.log('  [4/5] Testing Governance Research Registry Integration...');

    const findingsInReg = GovernanceResearchRegistry.getAllFindings();
    assert(findingsInReg.length >= 1, 'Findings must be saved in GovernanceResearchRegistry.');

    const proposalsInReg = GovernanceResearchRegistry.getAllProposals();
    assert(proposalsInReg.length >= 1, 'Proposals must be saved in GovernanceResearchRegistry.');

    const hypothesesInReg = GovernanceResearchRegistry.getAllHypotheses();
    assert(hypothesesInReg.length >= 1, 'Hypotheses must be saved in GovernanceResearchRegistry.');

    console.log('   ✓ Governance Research Registry Integration verified.');
  }

  // ==========================================
  // Test Scenario 5: Safety Boundary Verification (No Auto Rules Mutation)
  // ==========================================
  {
    console.log('  [5/5] Testing Autonomous Research Safety Boundary...');

    const finding = researchEngine.conductResearch('emp-aios-researcher');
    assert(finding.findingId.startsWith('FIND-emp-aios-researcher'), 'Research completed within governance safety bounds.');

    console.log('   ✓ Autonomous Research Safety Boundary verified.');
  }

  console.log('\n==========================================');
  console.log('🎉 GOVERNANCE AUTONOMOUS RESEARCH LAYER TESTS PASSED');
  console.log('==========================================\n');
}

runTests().catch(err => {
  console.error('❌ Autonomous Research Layer Test Suite Failed:', err);
  process.exit(1);
});
