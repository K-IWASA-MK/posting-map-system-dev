import { ILearningProvider } from './ILearningProvider';
import { LearningPattern } from '../models/LearningPattern';
import { ImprovementProposal } from '../models/ImprovementProposal';
import { Recommendation } from '../models/Recommendation';
import { SuccessPattern } from '../models/SuccessPattern';
import { FailurePattern } from '../models/FailurePattern';
import crypto from 'crypto';
import { RecommendationType } from '../models/RecommendationModel';

export class MockLearningProvider implements ILearningProvider {
    public async minePatterns(data: any[]): Promise<LearningPattern[]> {
        // Return dummy success and failure patterns
        const success: SuccessPattern = {
            patternId: crypto.randomUUID(),
            description: 'Mock Success Pattern',
            sourceIds: ['source-1'],
            confidence: { value: 0.9, occurrences: 10, lastObservedAt: new Date().toISOString() },
            successRate: 0.95,
            bestPractices: ['Do X', 'Do Y'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const failure: FailurePattern = {
            patternId: crypto.randomUUID(),
            description: 'Mock Failure Pattern',
            sourceIds: ['source-2'],
            confidence: { value: 0.8, occurrences: 5, lastObservedAt: new Date().toISOString() },
            failureRate: 0.4,
            rootCauses: ['Missing dependency', 'Network timeout'],
            recoveryStrategies: ['Retry', 'Use fallback'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        return [success, failure];
    }

    public async generateImprovements(patterns: LearningPattern[]): Promise<ImprovementProposal[]> {
        return patterns.map(p => ({
            improvementId: crypto.randomUUID(),
            description: `Improvement based on ${p.description}`,
            targetSystem: 'WORKFLOW_RUNTIME',
            riskAssessment: 'LOW',
            expectedImpact: 'Medium positive impact',
            priorityScore: 7,
            patternIds: [p.patternId],
            createdAt: new Date().toISOString()
        }));
    }

    public async generateRecommendations(patterns: LearningPattern[]): Promise<Recommendation[]> {
        return patterns.map(p => ({
            recommendationId: crypto.randomUUID(),
            action: `Action based on ${p.description}`,
            type: RecommendationType.AUTO,
            model: { modelId: 'mock-model', version: '1.0', description: 'Mock Recommender' },
            confidence: 0.85,
            createdAt: new Date().toISOString()
        }));
    }
}
