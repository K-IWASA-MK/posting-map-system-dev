import { ImprovementProposal } from '../models/ImprovementProposal';
import { ImprovementExecutionPlan } from '../models/ImprovementExecutionPlan';
import { RiskProfile } from '../models/RiskProfile';
import { ValidationResult } from '../models/ValidationResult';
import { RollbackPlan } from '../models/RollbackPlan';

export interface IAutonomousProvider {
    evaluateProposal(proposal: ImprovementProposal): Promise<boolean>;
    analyzeRisk(proposal: ImprovementProposal): Promise<RiskProfile>;
    generatePlan(proposal: ImprovementProposal, riskProfile: RiskProfile): Promise<ImprovementExecutionPlan>;
    executePlan(plan: ImprovementExecutionPlan): Promise<void>;
    validateExecution(plan: ImprovementExecutionPlan): Promise<ValidationResult>;
    rollback(rollbackPlan: RollbackPlan): Promise<void>;
}
