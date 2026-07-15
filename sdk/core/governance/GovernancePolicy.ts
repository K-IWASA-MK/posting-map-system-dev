export interface GovernancePolicy {
    executionPolicy: {
        autoApproveThreshold: number;
        requireManualIntervention: boolean;
    };
    isolationPolicy: {
        defaultLevel: string;
        strictMode: boolean;
    };
    promotionPolicy: {
        requireCodeReview: boolean;
    };
    compliancePolicy: {
        enforceSecurityScan: boolean;
        allowedDependencies: string[];
    };
    dependencyPolicy: {
        allowBreakingChanges: boolean;
    };
    emergencyPolicy: {
        allowBypass: boolean;
    };
}
