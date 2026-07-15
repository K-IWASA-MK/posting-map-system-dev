import { IAutonomousProvider } from '../providers/IAutonomousProvider';
import { ImprovementExecutionPlan } from '../models/ImprovementExecutionPlan';
import { ValidationResult } from '../models/ValidationResult';

export class ValidationService {
    constructor(private provider: IAutonomousProvider) {}

    public async validate(plan: ImprovementExecutionPlan): Promise<ValidationResult> {
        return this.provider.validateExecution(plan);
    }
}
