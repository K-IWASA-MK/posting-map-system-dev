import { ILearningProvider } from '../providers/ILearningProvider';
import { LearningPattern } from '../models/LearningPattern';
import { Recommendation } from '../models/Recommendation';

export class RecommendationService {
    constructor(private provider: ILearningProvider) {}

    public async generateRecommendations(patterns: LearningPattern[]): Promise<Recommendation[]> {
        return this.provider.generateRecommendations(patterns);
    }
}
