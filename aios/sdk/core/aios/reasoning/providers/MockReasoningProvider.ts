import { IReasoningProvider } from './IReasoningProvider';
import { Hypothesis } from '../models/Hypothesis';
import { Decision } from '../models/Decision';
import { ReasoningContext } from '../ReasoningContext';
import crypto from 'crypto';

export class MockReasoningProvider implements IReasoningProvider {
    public async evaluate(hypotheses: Hypothesis[], context: ReasoningContext): Promise<Hypothesis[]> {
        // Mock evaluation: just update confidence
        return hypotheses.map(h => ({
            ...h,
            confidence: {
                value: 0.85,
                calculatedAt: new Date().toISOString()
            }
        }));
    }

    public async makeDecision(hypotheses: Hypothesis[], context: ReasoningContext): Promise<Decision> {
        if (hypotheses.length === 0) {
            throw new Error('No hypotheses to make a decision from');
        }
        
        // Pick the first hypothesis
        const selected = hypotheses[0];
        
        return {
            decisionId: crypto.randomUUID(),
            conclusion: `Mock Decision based on: ${selected.statement}`,
            selectedHypothesisId: selected.hypothesisId,
            metadata: {
                reason: 'Mock Reason selected first hypothesis',
                score: selected.confidence.value,
                version: 1,
                source: 'MockReasoningProvider',
                timestamp: new Date().toISOString(),
                hash: crypto.createHash('sha256').update(selected.statement).digest('hex')
            }
        };
    }

    public async explain(decision: Decision, context: ReasoningContext): Promise<string> {
        return `This decision was made because the hypothesis had a high confidence score of ${decision.metadata.score}.`;
    }
}
