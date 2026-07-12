import { ReviewerRegistry } from '../../../../../../src/core/aios/reviewer/ReviewerRegistry';
import { MockGeminiReviewer } from '../../../../../../src/core/aios/reviewer/mock/MockGeminiReviewer';
import { MockClaudeReviewer } from '../../../../../../src/core/aios/reviewer/mock/MockClaudeReviewer';
import { DevelopmentContextBuilder } from '../../../../../../src/core/aios/context/DevelopmentContextBuilder';
import { DevelopmentContextType } from '../../../../../../src/core/aios/context/DevelopmentContextType';
import { DevelopmentReviewerId } from '../../../../../../src/core/aios/reviewer/DevelopmentReviewerId';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

function runTests() {
  console.log('Running ReviewerRegistry tests...');
  
  const registry = new ReviewerRegistry();
  const gemini = new MockGeminiReviewer();
  const claude = new MockClaudeReviewer();

  registry.register(gemini);
  registry.register(claude);
  
  assert(registry.findAll().length === 2, 'Should have 2 registered reviewers');

  const found = registry.findById(DevelopmentReviewerId.GEMINI);
  assert(found !== undefined && found.metadata.id === DevelopmentReviewerId.GEMINI, 'Should find GEMINI reviewer');

  let threwError = false;
  try {
    registry.register(gemini);
  } catch (e) {
    threwError = true;
  }
  assert(threwError, 'Should throw error when registering duplicate reviewer ID');

  const context = new DevelopmentContextBuilder()
    .setContextType(DevelopmentContextType.RepositoryReview)
    .setProject('test')
    .build();

  const supported = registry.findSupported(context);
  assert(supported.length === 2, 'Both reviewers should support this context');

  registry.clear();
  assert(registry.findAll().length === 0, 'Registry should be empty after clear');

  console.log('All ReviewerRegistry tests passed!');
}

runTests();
