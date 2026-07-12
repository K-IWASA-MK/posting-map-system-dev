import { ValidationStageRegistry } from '../../../../../../src/core/aios/validation/ValidationStageRegistry';
import { ValidationPipelineBuilder } from '../../../../../../src/core/aios/validation/ValidationPipelineBuilder';
import { RegexValidationStage } from '../../../../../../src/core/aios/validation/stages/RegexValidationStage';
import { AstValidationStage } from '../../../../../../src/core/aios/validation/stages/AstValidationStage';
import { AIReviewValidationStage } from '../../../../../../src/core/aios/validation/stages/AIReviewValidationStage';
import { DevelopmentContextBuilder } from '../../../../../../src/core/aios/context/DevelopmentContextBuilder';
import { DevelopmentContextType } from '../../../../../../src/core/aios/context/DevelopmentContextType';
import { ValidationStageType } from '../../../../../../src/core/aios/validation/ValidationStageType';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

function runTests() {
  console.log('Running ValidationPipelineBuilder tests...');
  
  const registry = new ValidationStageRegistry();
  // Register in random order to test sorting by priority
  registry.register(new AIReviewValidationStage()); // Priority 1000
  registry.register(new AstValidationStage()); // Priority 10
  registry.register(new RegexValidationStage()); // Priority 1

  const builder = new ValidationPipelineBuilder(registry);
  const context = new DevelopmentContextBuilder()
    .setContextType(DevelopmentContextType.RepositoryReview)
    .setProject('test')
    .build();

  const pipeline = builder.build(context);
  
  // Reflection/Hack to test private property for verification purposes
  const stages = (pipeline as any).stages;
  
  assert(stages.length === 3, 'Pipeline should contain 3 stages');
  // Order should be REGEX (1) -> AST (10) -> AI_REVIEW (1000)
  assert(stages[0].metadata.type === ValidationStageType.REGEX, 'First stage should be REGEX');
  assert(stages[1].metadata.type === ValidationStageType.AST, 'Second stage should be AST');
  assert(stages[2].metadata.type === ValidationStageType.AI_REVIEW, 'Third stage should be AI_REVIEW');

  console.log('All ValidationPipelineBuilder tests passed!');
}

runTests();
