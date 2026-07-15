import { ILearningProvider } from './ILearningProvider';
import { LearningPattern } from '../models/LearningPattern';
import { ImprovementProposal } from '../models/ImprovementProposal';
import { Recommendation } from '../models/Recommendation';

export class CompositeLearningProvider implements ILearningProvider {
    constructor(private providers: ILearningProvider[]) {}

    public async minePatterns(data: any[]): Promise<LearningPattern[]> {
        const results = await Promise.all(this.providers.map(p => p.minePatterns(data)));
        return results.flat();
    }

    public async generateImprovements(patterns: LearningPattern[]): Promise<ImprovementProposal[]> {
        const results = await Promise.all(this.providers.map(p => p.generateImprovements(patterns)));
        return results.flat();
    }

    public async generateRecommendations(patterns: LearningPattern[]): Promise<Recommendation[]> {
        const results = await Promise.all(this.providers.map(p => p.generateRecommendations(patterns)));
        return results.flat();
    }
}
