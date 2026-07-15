import { IAutonomousProvider } from '../providers/IAutonomousProvider';
import { ImprovementProposal } from '../models/ImprovementProposal';
import { RiskProfile } from '../models/RiskProfile';
import { ImprovementExecutionPlan } from '../models/ImprovementExecutionPlan';

export class ExecutionPlanningService {
    constructor(private provider: IAutonomousProvider) {}

    public async generatePlan(proposal: ImprovementProposal, riskProfile: RiskProfile): Promise<ImprovementExecutionPlan> {
        return this.provider.generatePlan(proposal, riskProfile);
    }
}
