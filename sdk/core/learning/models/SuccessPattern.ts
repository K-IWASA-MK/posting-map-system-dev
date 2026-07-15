import { LearningPattern } from './LearningPattern';

export interface SuccessPattern extends LearningPattern {
    successRate: number;
    bestPractices: string[];
}
