import { DevelopmentGovernancePolicy } from '../../../../../../sdk/core/aios/governance/DevelopmentGovernancePolicy';
import { DevelopmentGovernanceInput } from '../../../../../../sdk/core/aios/governance/DevelopmentGovernanceInput';
import { DevelopmentDecisionStatus } from '../../../../../../sdk/core/aios/governance/DevelopmentDecisionStatus';
import { DevelopmentAction } from '../../../../../../sdk/core/aios/governance/DevelopmentAction';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

function mockReview(id: string, conf: number, recs: string[] = []) {
  return {
    reviewerId: id,
    model: 'mock',
    confidence: conf,
    summary: '',
    findings: [],
    recommendations: recs,
    artifacts: [],
    durationMs: 10,
    generatedAt: ''
  };
}

function mockValidation(fails: number, warns: number, viols: number) {
  return {
    pipelineId: 'pipe',
    executedStages: [],
    skippedStages: [],
    failedStages: new Array(fails).fill('STAGE'),
    stageResults: [{
      stage: 'MOCK',
      status: fails > 0 ? 'FAIL' : 'PASS',
      warnings: new Array(warns).fill({}),
      violations: new Array(viols).fill({})
    }],
    estimatedCost: 10,
    actualCost: 10,
    totalDurationMs: 10
  } as any;
}

function runTests() {
  console.log('Running DevelopmentGovernancePolicy tests...');
  const policy = new DevelopmentGovernancePolicy();

  // CASE 1: FAIL=0, Confidence=0.99
  const input1: DevelopmentGovernanceInput = {
    validationResult: mockValidation(0, 0, 0),
    reviewResults: [mockReview('Gemini', 0.99)],
    session: null as any
  };
  const dec1 = policy.evaluate(input1);
  assert(dec1.status === DevelopmentDecisionStatus.PASS, 'Case 1 should PASS');
  assert(dec1.action === DevelopmentAction.PROCEED, 'Case 1 should PROCEED');

  // CASE 2: FAIL=1
  const input2: DevelopmentGovernanceInput = {
    validationResult: mockValidation(1, 0, 0),
    reviewResults: [mockReview('Gemini', 0.99)],
    session: null as any
  };
  const dec2 = policy.evaluate(input2);
  assert(dec2.status === DevelopmentDecisionStatus.FAILED, 'Case 2 should FAILED');
  assert(dec2.action === DevelopmentAction.BLOCK, 'Case 2 should BLOCK');

  // CASE 3: FAIL=0, Confidence=0.20
  const input3: DevelopmentGovernanceInput = {
    validationResult: mockValidation(0, 0, 0),
    reviewResults: [mockReview('Gemini', 0.20)],
    session: null as any
  };
  const dec3 = policy.evaluate(input3);
  assert(dec3.status === DevelopmentDecisionStatus.UNKNOWN, 'Case 3 should UNKNOWN');
  assert(dec3.action === DevelopmentAction.ESCALATE, 'Case 3 should ESCALATE');

  // CASE 4: WARNING=8
  const input4: DevelopmentGovernanceInput = {
    validationResult: mockValidation(0, 8, 0),
    reviewResults: [mockReview('Gemini', 0.90)],
    session: null as any
  };
  const dec4 = policy.evaluate(input4);
  assert(dec4.status === DevelopmentDecisionStatus.WARNING, 'Case 4 should WARNING');
  assert(dec4.action === DevelopmentAction.REVIEW_REQUIRED, 'Case 4 should REVIEW_REQUIRED');

  // CASE 5: No Input (Reviewer Error)
  const input5: DevelopmentGovernanceInput = {
    validationResult: null,
    reviewResults: [],
    session: null as any
  };
  const dec5 = policy.evaluate(input5);
  assert(dec5.status === DevelopmentDecisionStatus.UNKNOWN, 'Case 5 should UNKNOWN');
  assert(dec5.action === DevelopmentAction.RETRY, 'Case 5 should RETRY');

  // CASE 6: Multiple Reviewers (Consensus)
  const input6: DevelopmentGovernanceInput = {
    validationResult: mockValidation(0, 0, 0),
    reviewResults: [mockReview('Gemini', 0.85), mockReview('Claude', 0.95)],
    session: null as any
  };
  const dec6 = policy.evaluate(input6);
  assert(dec6.confidence === 0.95, 'Case 6 should pick max confidence 0.95');
  assert(dec6.confidenceSource === 'Consensus(Claude)', 'Case 6 should have Consensus Source');

  // CASE 7: Recommendations only
  const input7: DevelopmentGovernanceInput = {
    validationResult: mockValidation(0, 0, 0),
    reviewResults: [mockReview('Gemini', 0.95, ['Fix typo'])],
    session: null as any
  };
  const dec7 = policy.evaluate(input7);
  assert(dec7.status === DevelopmentDecisionStatus.PASS, 'Case 7 should PASS');
  assert(dec7.action === DevelopmentAction.PROCEED, 'Case 7 should PROCEED');
  assert(dec7.recommendations.length === 1, 'Case 7 should have 1 recommendation');

  console.log('All DevelopmentGovernancePolicy tests passed!');
}

runTests();
