import { ReviewerRegistry } from '../../../../../../src/core/aios/reviewer/ReviewerRegistry';
import { AIReviewValidationStage } from '../../../../../../src/core/aios/validation/stages/AIReviewValidationStage';
import { MockGeminiReviewer } from '../../../../../../src/core/aios/reviewer/mock/MockGeminiReviewer';
import { MockHumanReviewer } from '../../../../../../src/core/aios/reviewer/mock/MockHumanReviewer';
import { DevelopmentContextBuilder } from '../../../../../../src/core/aios/context/DevelopmentContextBuilder';
import { DevelopmentContextType } from '../../../../../../src/core/aios/context/DevelopmentContextType';
import { ExecutionSessionBuilder } from '../../../../../../src/core/aios/engine/ExecutionSession';
import { ValidationArtifactBuilder } from '../../../../../../src/core/aios/validation/ValidationArtifact';
import { ValidationExecutionContext } from '../../../../../../src/core/aios/validation/ValidationExecutionContext';
import { DevelopmentReviewerId } from '../../../../../../src/core/aios/reviewer/DevelopmentReviewerId';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

class FailingGeminiReviewer extends MockGeminiReviewer {
  protected async doReview(request: any): Promise<any> {
    throw new Error('Gemini API is down!');
  }
}

async function runTests() {
  console.log('Running AIReviewValidationStage Fallback tests...');
  
  const registry = new ReviewerRegistry();
  
  // Register a failing Gemini reviewer (Priority 100)
  registry.register(new FailingGeminiReviewer());
  
  // Register a working Human reviewer (Priority 0)
  registry.register(new MockHumanReviewer());

  const stage = new AIReviewValidationStage(registry);

  const context = new DevelopmentContextBuilder()
    .setContextType(DevelopmentContextType.RepositoryReview)
    .setProject('test')
    .build();

  const execContext: ValidationExecutionContext = {
    context,
    session: new ExecutionSessionBuilder().build(),
    pipelineId: 'test-pipeline',
    executionMode: 'strict'
  };

  const initialArtifact = ValidationArtifactBuilder.createInitial();

  const output = await stage.execute(execContext, initialArtifact);

  // Verification
  // The Gemini should fail, and Human should fallback successfully.
  const data = output.artifact.data as any;
  assert(data.reviewerUsed === DevelopmentReviewerId.HUMAN, 'Should fallback to HUMAN reviewer');
  assert(data.aiReviewResult.confidence === 1.0, 'Result should come from HUMAN reviewer (confidence 1.0)');

  console.log('All AIReviewValidationStage Fallback tests passed!');
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
