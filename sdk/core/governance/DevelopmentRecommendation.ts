import { RecommendationPriority } from './RecommendationPriority';

export interface DevelopmentRecommendation {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly priority: RecommendationPriority;
  readonly generatedAt: string;
}
