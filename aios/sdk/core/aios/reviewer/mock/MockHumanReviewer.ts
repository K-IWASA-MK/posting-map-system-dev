import { AbstractReviewer } from '../AbstractReviewer';
import { DevelopmentReviewerId } from '../DevelopmentReviewerId';
import { ReviewerProvider } from '../ReviewerProvider';
import { ReviewRequest } from '../ReviewRequest';
import { ReviewResult } from '../ReviewResult';

export class MockHumanReviewer extends AbstractReviewer {
  constructor() {
    super({
      id: DevelopmentReviewerId.HUMAN,
      name: 'Human Reviewer',
      version: '1.0',
      provider: ReviewerProvider.HUMAN,
      model: 'manual-review',
      capabilities: [],
      priority: 0, // Human is usually the ultimate fallback
      weight: 1.0,
      supportsStreaming: false,
      apiVersion: '1.0'
    });
  }

  protected async doReview(request: ReviewRequest): Promise<Omit<ReviewResult, 'durationMs' | 'generatedAt'>> {
    return {
      reviewerId: this.metadata.id,
      model: this.metadata.model,
      confidence: 1.0, // Human is considered 100% confident
      summary: 'Mock Human Review Summary (Approved)',
      findings: [],
      recommendations: [],
      artifacts: []
    };
  }
}
