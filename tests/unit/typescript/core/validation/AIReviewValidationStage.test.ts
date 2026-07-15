import { ReviewerRegistry } from '../../../../../sdk/core/reviewer/ReviewerRegistry';
import { AIReviewValidationStage } from '../../../../../sdk/core/validation/stages/AIReviewValidationStage';
import { MockGeminiReviewer } from '../../../../../sdk/core/reviewer/mock/MockGeminiReviewer';
import { MockHumanReviewer } from '../../../../../sdk/core/reviewer/mock/MockHumanReviewer';
import { DevelopmentContextBuilder } from '../../../../../sdk/core/context/DevelopmentContextBuilder';
import { DevelopmentContextType } from '../../../../../sdk/core/context/DevelopmentContextType';
import { ExecutionSessionBuilder } from '../../../../../sdk/core/engine/ExecutionSession';
import { ValidationArtifactBuilder } from '../../../../../sdk/core/validation/ValidationArtifact';
import { ValidationExecutionContext } from '../../../../../sdk/core/validation/ValidationExecutionContext';
import { DevelopmentReviewerId } from '../../../../../sdk/core/reviewer/DevelopmentReviewerId';

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
