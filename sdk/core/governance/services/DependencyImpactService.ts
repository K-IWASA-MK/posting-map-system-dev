import { IGovernanceProvider } from '../providers/IGovernanceProvider';
import { GovernanceRequest } from '../models/GovernanceRequest';
import { ImpactAnalysis } from '../models/ImpactAnalysis';

export class DependencyImpactService {
    constructor(private provider: IGovernanceProvider) {}

    public async analyze(request: GovernanceRequest): Promise<ImpactAnalysis> {
        return this.provider.analyzeImpact(request);
    }
}
