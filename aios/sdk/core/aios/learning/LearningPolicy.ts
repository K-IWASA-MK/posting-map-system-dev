export interface KnowledgePromotionPolicy {
    promotionThreshold: number; // minimum confidence score to promote
    autoPromotionEnabled: boolean;
}

export interface LearningPolicy {
    minimumConfidence: number;
    minimumOccurrences: number;
    minimumEvidence: number;
    failureLearningEnabled: boolean;
    promotionPolicy: KnowledgePromotionPolicy;
}
