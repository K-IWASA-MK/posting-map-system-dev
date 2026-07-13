import { RecommendationType, RecommendationModel } from './RecommendationModel';

export interface Recommendation {
    recommendationId: string;
    action: string;
    type: RecommendationType;
    model: RecommendationModel;
    confidence: number;
    createdAt: string;
}
