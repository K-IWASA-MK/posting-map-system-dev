import { DevelopmentReviewerId } from './DevelopmentReviewerId';
import { ReviewerProvider } from './ReviewerProvider';
import { ReviewerCapability } from './ReviewerCapability';

export interface ReviewerMetadata {
  readonly id: DevelopmentReviewerId | string;
  readonly name: string;
  readonly version: string;
  readonly provider: ReviewerProvider;
  readonly model: string;
  readonly capabilities: readonly ReviewerCapability[];
  readonly priority: number;
  readonly weight: number; // 0.0 to 1.0, used for selection
  readonly supportsStreaming: boolean;
  readonly apiVersion: string;
}
