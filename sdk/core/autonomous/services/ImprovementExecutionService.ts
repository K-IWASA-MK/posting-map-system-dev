import { IAutonomousProvider } from '../providers/IAutonomousProvider';
import { ImprovementExecutionPlan } from '../models/ImprovementExecutionPlan';

export class ImprovementExecutionService {
    constructor(private provider: IAutonomousProvider) {}

    public async execute(plan: ImprovementExecutionPlan): Promise<void> {
        return this.provider.executePlan(plan);
    }
}
