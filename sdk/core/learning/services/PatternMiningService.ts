import { ILearningProvider } from '../providers/ILearningProvider';
import { LearningPattern } from '../models/LearningPattern';
import { SuccessPattern } from '../models/SuccessPattern';

export class PatternMiningService {
    constructor(private provider: ILearningProvider) {}

    public async minePatterns(data: any[]): Promise<LearningPattern[]> {
        return this.provider.minePatterns(data);
    }
}
