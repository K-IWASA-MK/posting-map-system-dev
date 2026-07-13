import { IGovernanceProvider } from '../providers/IGovernanceProvider';
import { GovernanceRequest } from '../models/GovernanceRequest';

export class PolicyResolutionService {
    constructor(private provider: IGovernanceProvider) {}

    public async resolve(request: GovernanceRequest): Promise<void> {
        return this.provider.resolvePolicyConflict(request);
    }
}
