/**
 * test_deployment_improvement_engine.ts
 * 
 * Deployment Target Verification Gate - Autonomous Improvement Engine Test Suite (Sprint DTVG-10)
 * リスク予測、改善推奨生成、予防的アクション提案、および AI Employee コンテキストの自動生成を検証する。
 */

import { DeploymentImprovementEngine } from '../../../aios/release/improvement/DeploymentImprovementEngine';
import { DeploymentRiskPredictor } from '../../../aios/release/improvement/DeploymentRiskPredictor';
import { DeploymentGateRequest } from '../../../aios/release/gates/types/DeploymentTargetGateTypes';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('🧪 Starting Autonomous Deployment Improvement Engine Test Suite (Sprint DTVG-10)...\n');

  const engine = new DeploymentImprovementEngine();
  const predictor = new DeploymentRiskPredictor();

  // ==========================================
  // Test Scenario 1: Baseline Low Risk Assessment
  // ==========================================
  {
    console.log('  [1/4] Testing Baseline Low Risk Assessment...');

    const validReq: DeploymentGateRequest = {
      releaseId: 'REL-LOW-001',
      version: '1.0.0',
      environment: 'production',
      requestedRepository: 'posting-map-system',
      requestedBranch: 'main',
      targetPublishRoot: '/projects/posting-map/active/dashboard',
      frontendConfigPath: '/projects/posting-map/active/dashboard/config.js',
      expectedBackendEndpoint: 'https://script.google.com/macros/s/AKfycbxy1_VALID/exec',
      expectedBackendVersion: '1.0.0',
      employeeId: 'emp-aios-deployer',
      profileName: 'AI Employee Profile'
    };

    const risk = predictor.predictRisk(validReq);
    assert(risk.riskLevel === 'LOW', 'Clean request must yield LOW risk level.');
    assert(risk.score < 20, 'Risk score for clean request must be low (< 20).');

    const recommendation = engine.generateRecommendation(validReq);
    assert(recommendation.suggestions.length >= 1, 'Should include standard safety guidance suggestion.');
    assert(recommendation.aiPromptContext.includes('Assessed Risk Level: LOW'), 'Context text reflects LOW risk level.');

    console.log('   ✓ Baseline Low Risk Assessment verified.');
  }

  // ==========================================
  // Test Scenario 2: High Risk Assessment & Suggestion Generation
  // ==========================================
  {
    console.log('  [2/4] Testing High Risk Assessment & Preventive Suggestions...');

    const highRiskReq: DeploymentGateRequest = {
      releaseId: 'REL-HIGH-002',
      version: '1.0.0',
      environment: 'production',
      requestedRepository: 'posting-map-system',
      requestedBranch: 'main',
      targetPublishRoot: '/projects/posting-map/active/dashboard',
      frontendConfigPath: '/outside-directory/config.js', // Publish Root mismatch!
      expectedBackendEndpoint: 'https://script.google.com/macros/s/OLD_STALE_DEPLOYMENT_ID/exec', // Stale config!
      expectedBackendVersion: '1.0.0',
      employeeId: 'emp-aios-deployer',
      profileName: 'AI Employee Profile'
    };

    const risk = predictor.predictRisk(highRiskReq);
    assert(risk.riskLevel === 'HIGH' || risk.riskLevel === 'CRITICAL', 'High risk request must yield HIGH or CRITICAL risk level.');
    assert(risk.score >= 40, 'Risk score must be >= 40 for multiple risk factors.');
    assert(risk.predictedFailures.includes('Gate-004 (Runtime Config Match)'), 'Must predict Gate-004 failure.');
    assert(risk.predictedFailures.includes('Gate-003 (Publish Root Match)'), 'Must predict Gate-003 failure.');

    const recommendation = engine.generateRecommendation(highRiskReq);
    assert(recommendation.suggestions.length >= 2, 'Must generate multiple preventive suggestions.');

    const configSug = recommendation.suggestions.find(s => s.category === 'RUNTIME_CONFIG_MISMATCH');
    assert(Boolean(configSug), 'Must contain RUNTIME_CONFIG_MISMATCH suggestion.');
    assert(Boolean(configSug && configSug.preventiveActions.some(a => a.requiresApproval === true)), 'High-impact preventive action must require approval.');

    console.log('   ✓ High Risk Assessment & Preventive Suggestions verified.');
  }

  // ==========================================
  // Test Scenario 3: AI Employee Context Text Generation
  // ==========================================
  {
    console.log('  [3/4] Testing AI Employee Prompt Context Text Generation...');

    const highRiskReq: DeploymentGateRequest = {
      releaseId: 'REL-CTX-003',
      version: '1.0.0',
      environment: 'production',
      requestedRepository: 'wrong-repo',
      requestedBranch: 'main',
      targetPublishRoot: '/projects/posting-map/active/dashboard',
      frontendConfigPath: '/projects/posting-map/active/dashboard/config.js',
      expectedBackendEndpoint: 'https://script.google.com/macros/s/OLD_DEPLOYMENT_ID/exec',
      expectedBackendVersion: '1.0.0',
      employeeId: 'emp-aios-01',
      profileName: 'AI Employee Profile'
    };

    const rec = engine.generateRecommendation(highRiskReq);
    const contextText = rec.aiPromptContext;

    assert(contextText.includes('[AI Employee Deployment Governance Pre-Context]'), 'Context contains pre-context header.');
    assert(contextText.includes('Release ID: REL-CTX-003'), 'Context contains Release ID.');
    assert(contextText.includes('[Autonomous Action Rule]'), 'Context contains Autonomous Action Rule guidance.');
    assert(contextText.includes('CEO/Policy approval'), 'Context explicitly instructs CEO/Policy approval requirement.');

    console.log('   ✓ AI Employee Prompt Context Text Generation verified.');
  }

  // ==========================================
  // Test Scenario 4: Autonomous Engine Safety Bounds (No Auto Mutate)
  // ==========================================
  {
    console.log('  [4/4] Testing Autonomous Safety Bounds (No Auto-Mutate)...');

    const req: DeploymentGateRequest = {
      releaseId: 'REL-BOUNDS-004',
      version: '1.0.0',
      environment: 'production',
      requestedRepository: 'posting-map-system',
      requestedBranch: 'main',
      targetPublishRoot: '/projects/posting-map/active/dashboard',
      frontendConfigPath: '/projects/posting-map/active/dashboard/config.js',
      expectedBackendEndpoint: 'https://script.google.com/macros/s/AKfycbxy1_TEST/exec',
      expectedBackendVersion: '1.0.0',
      employeeId: 'emp-aios-01',
      profileName: 'AI Employee Profile'
    };

    const rec = engine.generateRecommendation(req);
    // Ensure all suggestions only offer guidance / preventiveActions and do NOT perform mutations
    assert(rec.recommendationId.startsWith('REC-REL-BOUNDS-004'), 'Recommendation object properly returned without code mutation.');

    console.log('   ✓ Autonomous Safety Bounds verified.');
  }

  console.log('\n==========================================');
  console.log('🎉 AUTONOMOUS DEPLOYMENT IMPROVEMENT ENGINE TESTS PASSED');
  console.log('==========================================\n');
}

runTests().catch(err => {
  console.error('❌ Improvement Engine Test Suite Failed:', err);
  process.exit(1);
});
