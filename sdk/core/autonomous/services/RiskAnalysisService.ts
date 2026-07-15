import { IAutonomousProvider } from '../providers/IAutonomousProvider';
import { ImprovementProposal } from '../models/ImprovementProposal';
import { RiskProfile } from '../models/RiskProfile';

export class RiskAnalysisService {
    constructor(private provider: IAutonomousProvider) {}

    public async analyze(proposal: ImprovementProposal): Promise<RiskProfile> {
        return this.provider.analyzeRisk(proposal);
    }
}
