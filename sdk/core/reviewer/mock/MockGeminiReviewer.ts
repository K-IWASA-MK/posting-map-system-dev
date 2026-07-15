import { AbstractReviewer } from '../AbstractReviewer';
import { DevelopmentReviewerId } from '../DevelopmentReviewerId';
import { ReviewerProvider } from '../ReviewerProvider';
import { ReviewRequest } from '../ReviewRequest';
import { ReviewResult } from '../ReviewResult';

export class MockGeminiReviewer extends AbstractReviewer {
  constructor() {
    super({
      id: DevelopmentReviewerId.GEMINI,
      name: 'Mock Gemini Reviewer',
      version: '1.5-pro',
      provider: ReviewerProvider.GOOGLE,
      model: 'gemini-1.5-pro',
      capabilities: [],
      priority: 100,
      weight: 0.95,
      supportsStreaming: false,
      apiVersion: 'v1beta'
    });
  }

  protected async doReview(request: ReviewRequest): Promise<Omit<ReviewResult, 'durationMs' | 'generatedAt'>> {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 50));

    return {
      reviewerId: this.metadata.id,
      model: this.metadata.model,
      confidence: 0.95,
      summary: 'Mock Gemini Review Summary',
      findings: [],
      recommendations: ['Consider using React.memo for this component'],
      artifacts: [{
        id: 'mock-gemini-fix',
        type: 'CODE_FIX',
        title: 'Suggested Fix',
        content: 'function Component() { return <div />; }',
        language: 'tsx'
      }]
    };
  }
}
