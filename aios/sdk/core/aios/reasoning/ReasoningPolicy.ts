export enum ConflictResolutionStrategy {
    HighestConfidence = 'HighestConfidence',
    HighestPriority = 'HighestPriority',
    LatestEvidence = 'LatestEvidence',
    HumanOverride = 'HumanOverride',
    WeightedAverage = 'WeightedAverage'
}

export interface ConfidencePolicy {
    minimumConfidence: number;
    approvalThreshold: number;
    rejectionThreshold: number;
    autoEscalationThreshold: number;
}

export interface ReasoningPolicy {
    conflictResolutionStrategy: ConflictResolutionStrategy;
    confidence: ConfidencePolicy;
    maxDepth: number;
    maxEvidenceCount: number;
}
