import { ValidationStageRegistry } from '../../../../../sdk/core/validation/ValidationStageRegistry';
import { ValidationPipelineBuilder } from '../../../../../sdk/core/validation/ValidationPipelineBuilder';
import { RegexValidationStage } from '../../../../../sdk/core/validation/stages/RegexValidationStage';
import { AstValidationStage } from '../../../../../sdk/core/validation/stages/AstValidationStage';
import { SemanticValidationStage } from '../../../../../sdk/core/validation/stages/SemanticValidationStage';
import { ContextValidationStage } from '../../../../../sdk/core/validation/stages/ContextValidationStage';
import { AIReviewValidationStage } from '../../../../../sdk/core/validation/stages/AIReviewValidationStage';
import { ReviewerRegistry } from '../../../../../sdk/core/reviewer/ReviewerRegistry';
import { MockHumanReviewer } from '../../../../../sdk/core/reviewer/mock/MockHumanReviewer';
import { DevelopmentContextBuilder } from '../../../../../sdk/core/context/DevelopmentContextBuilder';
import { DevelopmentContextType } from '../../../../../sdk/core/context/DevelopmentContextType';
import { ExecutionSessionBuilder } from '../../../../../sdk/core/engine/ExecutionSession';
import { ValidationExecutionContext } from '../../../../../sdk/core/validation/ValidationExecutionContext';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('Running ValidationPipeline tests...');
  
  const registry = new ValidationStageRegistry();
  const reviewerRegistry = new ReviewerRegistry();
  reviewerRegistry.register(new MockHumanReviewer());
  registry.register(new AIReviewValidationStage(reviewerRegistry));
  registry.register(new AstValidationStage());
  registry.register(new RegexValidationStage());
  registry.register(new SemanticValidationStage());
  registry.register(new ContextValidationStage());

  const builder = new ValidationPipelineBuilder(registry);
  const devContext = new DevelopmentContextBuilder()
    .setContextType(DevelopmentContextType.RepositoryReview)
    .setProject('test')
    .build();

  const pipeline = builder.build(devContext);

  const execContext: ValidationExecutionContext = {
    context: devContext,
    session: new ExecutionSessionBuilder().build(),
    pipelineId: 'test-pipeline',
    executionMode: 'strict'
  };

  const result = await pipeline.execute(execContext);

  assert(result.executedStages.length === 5, 'All 5 stages should execute');
  assert(result.skippedStages.length === 0, 'No stages should be skipped');
  assert(result.failedStages.length === 0, 'No stages should fail');
  
  // Estimated Cost calculation: Regex(1) + AST(10) + Semantic(40) + Context(50) + AIReview(1000) = 1101
  assert(result.estimatedCost === 1101, `Estimated cost should be 1101, got ${result.estimatedCost}`);
  assert(result.actualCost === 1101, `Actual cost should be 1101, got ${result.actualCost}`);

  assert(result.stageResults.length === 5, 'Should have 5 stage results');
  
  // Regex stage mocked a warning
  const regexResult = result.stageResults.find(r => r.stage === 'REGEX');
  assert(regexResult !== undefined, 'Should have REGEX result');
  assert(regexResult!.warnings.length === 1, 'REGEX should produce 1 warning');

  console.log('All ValidationPipeline tests passed!');
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
