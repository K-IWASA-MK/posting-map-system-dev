import { AbstractReviewer } from '../AbstractReviewer';
import { DevelopmentReviewerId } from '../DevelopmentReviewerId';
import { ReviewerProvider } from '../ReviewerProvider';
import { ReviewRequest } from '../ReviewRequest';
import { ReviewResult } from '../ReviewResult';

export class MockClaudeReviewer extends AbstractReviewer {
  constructor() {
    super({
      id: DevelopmentReviewerId.CLAUDE,
      name: 'Mock Claude Reviewer',
      version: '3.5-sonnet',
      provider: ReviewerProvider.ANTHROPIC,
      model: 'claude-3.5-sonnet',
      capabilities: [],
      priority: 100,
      weight: 0.90, // Slightly lower weight than Gemini for testing fallback
      supportsStreaming: false,
      apiVersion: '2023-06-01'
    });
  }

  protected async doReview(request: ReviewRequest): Promise<Omit<ReviewResult, 'durationMs' | 'generatedAt'>> {
    return {
      reviewerId: this.metadata.id,
      model: this.metadata.model,
      confidence: 0.92,
      summary: 'Mock Claude Review Summary',
      findings: [],
      recommendations: ['Claude recommends checking edge cases'],
      artifacts: []
    };
  }
}
