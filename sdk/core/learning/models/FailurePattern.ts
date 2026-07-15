import { LearningPattern } from './LearningPattern';

export interface FailurePattern extends LearningPattern {
    failureRate: number;
    rootCauses: string[];
    recoveryStrategies: string[];
}
