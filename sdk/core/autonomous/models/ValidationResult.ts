export interface ValidationResult {
    resultId: string;
    planId: string;
    validationRule: string;
    validationEvidence: string;
    validationScore: number;
    validationSummary: string;
    validationArtifact: string;
    isSuccessful: boolean;
    validatedAt: string;
}
