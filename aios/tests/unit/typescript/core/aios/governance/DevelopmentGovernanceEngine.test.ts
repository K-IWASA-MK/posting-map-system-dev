import { DevelopmentGovernanceEngine } from '../../../../../../sdk/core/aios/governance/DevelopmentGovernanceEngine';
import { DevelopmentGovernanceInput } from '../../../../../../sdk/core/aios/governance/DevelopmentGovernanceInput';
import { DevelopmentGovernanceExporter } from '../../../../../../sdk/core/aios/governance/DevelopmentGovernanceExporter';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

function runTests() {
  console.log('Running DevelopmentGovernanceEngine tests...');
  
  const engine = new DevelopmentGovernanceEngine();
  
  const input: DevelopmentGovernanceInput = {
    validationResult: {
      pipelineId: 'p1',
      executedStages: [],
      skippedStages: [],
      failedStages: [],
      stageResults: [],
      estimatedCost: 100,
      actualCost: 100,
      totalDurationMs: 50
    } as any,
    reviewResults: [{
      reviewerId: 'Gemini',
      model: 'gemini-1.5',
      confidence: 0.99,
      summary: 'Looks good',
      findings: [],
      recommendations: [],
      artifacts: [],
      durationMs: 200,
      generatedAt: ''
    }],
    session: null as any
  };

  const result = engine.evaluate(input);

  assert(result.decision !== undefined, 'Engine should return a decision');
  assert(result.metadata.evaluatedBy === 'DevelopmentGovernanceEngine', 'Should contain Engine metadata');
  assert(result.inputSummary.totalReviewers === 1, 'Input summary should reflect reviewers');

  // Verify exporter doesn't throw
  DevelopmentGovernanceExporter.toConsole(result);

  console.log('All DevelopmentGovernanceEngine tests passed!');
}

runTests();
