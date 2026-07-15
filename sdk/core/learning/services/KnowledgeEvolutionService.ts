import { LearningPolicy } from '../LearningPolicy';
import { LearningPattern } from '../models/LearningPattern';
import { KnowledgePromotion } from '../models/KnowledgePromotion';
import crypto from 'crypto';

export class KnowledgeEvolutionService {
    constructor(private policy: LearningPolicy) {}

    public evaluateForPromotion(patterns: LearningPattern[]): KnowledgePromotion[] {
        const promotions: KnowledgePromotion[] = [];
        
        for (const pattern of patterns) {
            if (pattern.confidence.value >= this.policy.promotionPolicy.promotionThreshold) {
                promotions.push({
                    promotionId: crypto.randomUUID(),
                    memoryId: pattern.patternId,
                    promotionReason: `Confidence score ${pattern.confidence.value} exceeded threshold ${this.policy.promotionPolicy.promotionThreshold}`,
                    promotionEvidence: pattern.sourceIds,
                    promotionScore: pattern.confidence.value,
                    promotedAt: new Date().toISOString()
                });
            }
        }

        return promotions;
    }
}
