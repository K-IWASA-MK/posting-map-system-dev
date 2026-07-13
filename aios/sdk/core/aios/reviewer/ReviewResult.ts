import { DevelopmentReviewerId } from './DevelopmentReviewerId';
import { ReviewArtifact } from './ReviewArtifact';
import { ValidationViolation } from '../validation/ValidationArtifact';

export interface ReviewResult {
  readonly reviewerId: DevelopmentReviewerId | string;
  readonly model: string;
  readonly confidence: number; // 0.0 to 1.0
  readonly summary: string;
  readonly findings: readonly ValidationViolation[];
  readonly recommendations: readonly string[];
  readonly artifacts: readonly ReviewArtifact[];
  readonly durationMs: number;
  readonly generatedAt: string;
}
