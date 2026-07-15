import { GovernanceRequest } from '../models/GovernanceRequest';
import { ImpactAnalysis } from '../models/ImpactAnalysis';
import { ComplianceReport } from '../models/ComplianceReport';
import { GovernanceDecision } from '../models/GovernanceDecision';

export interface IGovernanceProvider {
    evaluatePolicy(request: GovernanceRequest): Promise<boolean>;
    resolvePolicyConflict(request: GovernanceRequest): Promise<void>;
    analyzeImpact(request: GovernanceRequest): Promise<ImpactAnalysis>;
    validateCompliance(request: GovernanceRequest): Promise<ComplianceReport>;
    makeDecision(request: GovernanceRequest, impact: ImpactAnalysis, compliance: ComplianceReport): Promise<GovernanceDecision>;
    enforceIsolation(decision: GovernanceDecision): Promise<void>;
}
