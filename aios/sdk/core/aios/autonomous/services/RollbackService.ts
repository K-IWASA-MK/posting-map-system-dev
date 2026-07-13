import { IAutonomousProvider } from '../providers/IAutonomousProvider';
import { RollbackPlan } from '../models/RollbackPlan';

export class RollbackService {
    constructor(private provider: IAutonomousProvider) {}

    public async rollback(plan: RollbackPlan): Promise<void> {
        return this.provider.rollback(plan);
    }
}
