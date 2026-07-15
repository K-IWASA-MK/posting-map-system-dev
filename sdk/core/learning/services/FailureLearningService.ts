import { ILearningProvider } from '../providers/ILearningProvider';
import { LearningPattern } from '../models/LearningPattern';
import { FailurePattern } from '../models/FailurePattern';

export class FailureLearningService {
    constructor(private provider: ILearningProvider) {}

    public async analyzeFailures(data: any[]): Promise<FailurePattern[]> {
        const patterns = await this.provider.minePatterns(data);
        return patterns.filter(p => 'failureRate' in p) as FailurePattern[];
    }
}
