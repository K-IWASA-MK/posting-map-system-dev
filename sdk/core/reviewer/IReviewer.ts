import { DevelopmentContext } from '../context/DevelopmentContext';
import { ReviewerMetadata } from './ReviewerMetadata';
import { ReviewRequest } from './ReviewRequest';
import { ReviewResult } from './ReviewResult';

export interface IReviewer {
  readonly metadata: ReviewerMetadata;

  supports(context: DevelopmentContext): boolean;
  
  review(request: ReviewRequest): Promise<ReviewResult>;
  
  dispose(): Promise<void>;
}
