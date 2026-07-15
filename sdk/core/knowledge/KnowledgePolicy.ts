export interface KnowledgePolicy {
    evolutionRules: {
        requireValidationForVerified: boolean;
        requireApprovalForReusable: boolean;
        autoDeprecateOnSupersede: boolean;
    };
    retention: {
        maxArchivedDays: number;
        maxVersionsToKeep: number;
    };
    safetyLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}
