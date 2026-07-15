import { ReviewerRegistry } from '../../../../../sdk/core/reviewer/ReviewerRegistry';
import { ReviewerLoader } from '../../../../../sdk/core/reviewer/ReviewerLoader';
import { MockGeminiReviewer } from '../../../../../sdk/core/reviewer/mock/MockGeminiReviewer';
import { MockClaudeReviewer } from '../../../../../sdk/core/reviewer/mock/MockClaudeReviewer';
import { MockHumanReviewer } from '../../../../../sdk/core/reviewer/mock/MockHumanReviewer';
import { DevelopmentContextBuilder } from '../../../../../sdk/core/context/DevelopmentContextBuilder';
import { DevelopmentContextType } from '../../../../../sdk/core/context/DevelopmentContextType';
import { DevelopmentReviewerId } from '../../../../../sdk/core/reviewer/DevelopmentReviewerId';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

function runTests() {
  console.log('Running ReviewerLoader tests...');
  
  const registry = new ReviewerRegistry();
  
  // Register in random order
  registry.register(new MockHumanReviewer()); // priority: 0, weight: 1.0
  registry.register(new MockClaudeReviewer()); // priority: 100, weight: 0.90
  registry.register(new MockGeminiReviewer()); // priority: 100, weight: 0.95

  const loader = new ReviewerLoader();
  const context = new DevelopmentContextBuilder()
    .setContextType(DevelopmentContextType.RepositoryReview)
    .setProject('test')
    .build();

  const optimalReviewers = loader.findOptimal(registry, context);

  assert(optimalReviewers.length === 3, 'Should extract all 3 reviewers');
  
  // Expected sort order: Priority > Weight
  // 1. Gemini (Priority 100, Weight 0.95)
  // 2. Claude (Priority 100, Weight 0.90)
  // 3. Human (Priority 0, Weight 1.0)
  assert(optimalReviewers[0].reviewer.metadata.id === DevelopmentReviewerId.GEMINI, '1st should be Gemini (Highest weight among priority 100)');
  assert(optimalReviewers[0].selectionReason === 'Highest Priority & Weight', '1st should have correct reason');

  assert(optimalReviewers[1].reviewer.metadata.id === DevelopmentReviewerId.CLAUDE, '2nd should be Claude (Lower weight among priority 100)');
  assert(optimalReviewers[1].selectionReason === 'Fallback Selection', '2nd should be fallback');

  assert(optimalReviewers[2].reviewer.metadata.id === DevelopmentReviewerId.HUMAN, '3rd should be Human (Priority 0)');

  console.log('All ReviewerLoader tests passed!');
}

runTests();
