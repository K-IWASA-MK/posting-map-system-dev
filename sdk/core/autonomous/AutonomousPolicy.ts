export interface AutonomousPolicy {
    approvalPolicy: {
        autoApproveRiskThreshold: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        requiresManualApprovalFor: ('PROMPT' | 'WORKFLOW' | 'ARCHITECTURE' | 'CODE' | 'CONFIGURATION')[];
    };
    promotionPolicy: {
        minimumValidationScore: number;
        autoPromote: boolean;
    };
    executionPolicy: {
        maxConcurrentExecutions: number;
        globalTimeoutMs: number;
    };
    validationPolicy: {
        strictMode: boolean;
        minimumConfidence: number;
    };
    evolutionPolicy: {
        enabled: boolean;
    };
    governancePolicy: {
        enforceApprovalWorkflow: boolean;
        auditLogging: boolean;
    };
}
