import { Improvement } from './Improvement';

export interface ImprovementProposal extends Improvement {
    riskAssessment: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    expectedImpact: string;
    priorityScore: number; // 0 to 10
    patternIds: string[];
}
