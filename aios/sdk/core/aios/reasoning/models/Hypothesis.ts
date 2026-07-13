import { ConfidenceScore } from './ConfidenceScore';

export interface Hypothesis {
    hypothesisId: string;
    statement: string;
    supportingEvidenceIds: string[];
    contradictingEvidenceIds: string[];
    confidence: ConfidenceScore;
    generatedAt: string;
}
