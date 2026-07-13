import { IGovernanceProvider } from '../providers/IGovernanceProvider';
import { GovernanceRequest } from '../models/GovernanceRequest';
import { ComplianceReport } from '../models/ComplianceReport';

export class ComplianceValidationService {
    constructor(private provider: IGovernanceProvider) {}

    public async validate(request: GovernanceRequest): Promise<ComplianceReport> {
        return this.provider.validateCompliance(request);
    }
}
