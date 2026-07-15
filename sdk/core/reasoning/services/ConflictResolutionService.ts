import { Hypothesis } from '../models/Hypothesis';
import { ReasoningPolicy, ConflictResolutionStrategy } from '../ReasoningPolicy';

export class ConflictResolutionService {
    constructor(private policy: ReasoningPolicy) {}

    public resolve(hypotheses: Hypothesis[]): Hypothesis[] {
        if (hypotheses.length <= 1) return hypotheses;

        // Sort by strategy
        switch (this.policy.conflictResolutionStrategy) {
            case ConflictResolutionStrategy.HighestConfidence:
                return hypotheses.sort((a, b) => b.confidence.value - a.confidence.value);
            case ConflictResolutionStrategy.LatestEvidence:
                return hypotheses.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
            default:
                return hypotheses.sort((a, b) => b.confidence.value - a.confidence.value);
        }
    }
}
