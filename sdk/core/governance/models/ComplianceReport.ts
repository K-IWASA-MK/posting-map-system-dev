export interface ComplianceReport {
    reportId: string;
    requestId: string;
    complianceScore: number;
    failedRules: string[];
    passedRules: string[];
    policyEvidence: string;
    evidenceHash: string;
    severity: string;
    recommendation: string;
    validatedAt: string;
}
