import { IAutonomousProvider } from '../providers/IAutonomousProvider';
import { ImprovementProposal } from '../models/ImprovementProposal';

export class ProposalEvaluationService {
    constructor(private provider: IAutonomousProvider) {}

    public async evaluate(proposal: ImprovementProposal): Promise<boolean> {
        return this.provider.evaluateProposal(proposal);
    }
}
