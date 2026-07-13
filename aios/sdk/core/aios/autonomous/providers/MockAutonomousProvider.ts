import { IAutonomousProvider } from './IAutonomousProvider';
import { ImprovementProposal } from '../models/ImprovementProposal';
import { ImprovementExecutionPlan } from '../models/ImprovementExecutionPlan';
import { RiskProfile } from '../models/RiskProfile';
import { ValidationResult } from '../models/ValidationResult';
import { RollbackPlan } from '../models/RollbackPlan';
import crypto from 'crypto';

export class MockAutonomousProvider implements IAutonomousProvider {
    public async evaluateProposal(proposal: ImprovementProposal): Promise<boolean> {
        // Mock evaluation logic
        return proposal.priority !== 'LOW';
    }

    public async analyzeRisk(proposal: ImprovementProposal): Promise<RiskProfile> {
        const category = proposal.priority === 'CRITICAL' ? 'HIGH' : 'LOW';
        return {
            profileId: crypto.randomUUID(),
            proposalId: proposal.proposalId,
            riskScore: category === 'HIGH' ? 85 : 20,
            riskCategory: category,
            riskSource: 'MockAnalysis',
            confidence: 0.9,
            mitigation: 'Mock mitigation strategy',
            residualRisk: 'Minimal',
            analyzedAt: new Date().toISOString()
        };
    }

    public async generatePlan(proposal: ImprovementProposal, riskProfile: RiskProfile): Promise<ImprovementExecutionPlan> {
        return {
            planId: crypto.randomUUID(),
            proposalId: proposal.proposalId,
            steps: [
                {
                    stepId: crypto.randomUUID(),
                    order: 1,
                    actionType: 'MOCK_ACTION',
                    payload: proposal.content,
                    preCondition: 'System is healthy',
                    postCondition: 'Change applied',
                    expectedOutput: 'Success',
                    rollbackPoint: true,
                    timeoutMs: 5000,
                    retryPolicy: { maxAttempts: 3, backoffMs: 1000 },
                    executionPolicy: 'SEQUENTIAL'
                }
            ],
            estimatedDurationMs: 1000,
            requiresDowntime: false,
            createdAt: new Date().toISOString()
        };
    }

    public async executePlan(plan: ImprovementExecutionPlan): Promise<void> {
        // Simulate execution
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    public async validateExecution(plan: ImprovementExecutionPlan): Promise<ValidationResult> {
        // For testing, mock a successful validation, unless payload specifically says "FAIL_VALIDATION"
        const shouldFail = plan.steps.some(s => s.payload === 'FAIL_VALIDATION');
        return {
            resultId: crypto.randomUUID(),
            planId: plan.planId,
            validationRule: 'MockRule',
            validationEvidence: 'MockEvidence',
            validationScore: shouldFail ? 0 : 100,
            validationSummary: shouldFail ? 'Validation Failed' : 'Validation Passed',
            validationArtifact: 'mock-artifact.json',
            isSuccessful: !shouldFail,
            validatedAt: new Date().toISOString()
        };
    }

    public async rollback(rollbackPlan: RollbackPlan): Promise<void> {
        // Simulate rollback
        await new Promise(resolve => setTimeout(resolve, 50));
        rollbackPlan.rollbackResult = 'SUCCESS';
    }
}
