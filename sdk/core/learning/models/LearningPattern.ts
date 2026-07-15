import { PatternConfidence } from './PatternConfidence';

export interface LearningPattern {
    patternId: string;
    description: string;
    sourceIds: string[];
    confidence: PatternConfidence;
    createdAt: string;
    updatedAt: string;
}
