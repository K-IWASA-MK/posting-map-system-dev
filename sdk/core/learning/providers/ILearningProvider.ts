import { LearningPattern } from '../models/LearningPattern';
import { ImprovementProposal } from '../models/ImprovementProposal';
import { Recommendation } from '../models/Recommendation';

export interface ILearningProvider {
    minePatterns(data: any[]): Promise<LearningPattern[]>;
    generateImprovements(patterns: LearningPattern[]): Promise<ImprovementProposal[]>;
    generateRecommendations(patterns: LearningPattern[]): Promise<Recommendation[]>;
}
