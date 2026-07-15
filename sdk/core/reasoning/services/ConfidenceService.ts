import { Hypothesis } from '../models/Hypothesis';
import { Evidence } from '../models/Evidence';
import { ReasoningPolicy } from '../ReasoningPolicy';

export class ConfidenceService {
    constructor(private policy: ReasoningPolicy) {}

    public calculateConfidence(hypothesis: Hypothesis, evidenceMap: Map<string, Evidence>): number {
        if (hypothesis.supportingEvidenceIds.length === 0) return 0;

        let totalWeight = 0;
        let weightedSum = 0;

        hypothesis.supportingEvidenceIds.forEach(id => {
            const ev = evidenceMap.get(id);
            if (ev) {
                totalWeight += ev.weight;
                weightedSum += (ev.reliability * ev.weight);
            }
        });

        if (totalWeight === 0) return 0.1; // Base min

        let score = weightedSum / totalWeight;

        // Penalty for contradictions
        if (hypothesis.contradictingEvidenceIds.length > 0) {
            score -= (hypothesis.contradictingEvidenceIds.length * 0.1);
        }

        return Math.max(0, Math.min(1, score));
    }

    public isApproved(score: number): boolean {
        return score >= this.policy.confidence.approvalThreshold;
    }
}
