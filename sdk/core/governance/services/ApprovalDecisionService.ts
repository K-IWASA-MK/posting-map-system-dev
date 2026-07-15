import { IGovernanceProvider } from '../providers/IGovernanceProvider';
import { GovernanceRequest } from '../models/GovernanceRequest';
import { ImpactAnalysis } from '../models/ImpactAnalysis';
import { ComplianceReport } from '../models/ComplianceReport';
import { GovernanceDecision } from '../models/GovernanceDecision';

export class ApprovalDecisionService {
    constructor(private provider: IGovernanceProvider) {}

    public async decide(request: GovernanceRequest, impact: ImpactAnalysis, compliance: ComplianceReport): Promise<GovernanceDecision> {
        return this.provider.makeDecision(request, impact, compliance);
    }
}
