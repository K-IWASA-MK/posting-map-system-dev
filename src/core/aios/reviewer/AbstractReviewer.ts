import { DevelopmentContext } from '../context/DevelopmentContext';
import { IReviewer } from './IReviewer';
import { ReviewerMetadata } from './ReviewerMetadata';
import { ReviewRequest } from './ReviewRequest';
import { ReviewResult } from './ReviewResult';

export abstract class AbstractReviewer implements IReviewer {
  public readonly metadata: ReviewerMetadata;

  constructor(metadata: ReviewerMetadata) {
    this.metadata = Object.freeze({ ...metadata });
  }

  public supports(context: DevelopmentContext): boolean {
    // Override if specific context checks are needed.
    // By default, assume it supports if it's registered for this purpose.
    return true;
  }

  public async review(request: ReviewRequest): Promise<ReviewResult> {
    const startTime = Date.now();
    try {
      const result = await this.doReview(request);
      return Object.freeze({
        ...result,
        durationMs: Date.now() - startTime,
        generatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Reviewer ${this.metadata.id} failed:`, error);
      throw error;
    }
  }

  protected abstract doReview(request: ReviewRequest): Promise<Omit<ReviewResult, 'durationMs' | 'generatedAt'>>;

  public async dispose(): Promise<void> {
    // Optional cleanup
  }
}
