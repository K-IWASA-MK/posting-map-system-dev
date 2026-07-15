export interface RiskProfile {
    profileId: string;
    proposalId: string;
    riskScore: number;
    riskCategory: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    riskSource: string;
    confidence: number;
    mitigation: string;
    residualRisk: string;
    analyzedAt: string;
}
