import { IInferenceProvider } from './IInferenceProvider';
import { Evidence } from '../models/Evidence';
import { Hypothesis } from '../models/Hypothesis';
import { ReasoningContext } from '../ReasoningContext';
import crypto from 'crypto';

export class MockInferenceProvider implements IInferenceProvider {
    public async infer(evidence: Evidence[], context: ReasoningContext): Promise<Hypothesis[]> {
        if (evidence.length === 0) {
            return [];
        }

        const hypothesisId = crypto.randomUUID();
        return [{
            hypothesisId,
            statement: `Inferred from ${evidence.length} pieces of evidence.`,
            supportingEvidenceIds: evidence.map(e => e.evidenceId),
            contradictingEvidenceIds: [],
            confidence: {
                value: 0.75,
                calculatedAt: new Date().toISOString()
            },
            generatedAt: new Date().toISOString()
        }];
    }
}
