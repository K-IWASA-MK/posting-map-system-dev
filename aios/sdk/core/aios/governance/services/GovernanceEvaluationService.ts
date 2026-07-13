import { IGovernanceProvider } from '../providers/IGovernanceProvider';
import { GovernanceRequest } from '../models/GovernanceRequest';

export class GovernanceEvaluationService {
    constructor(private provider: IGovernanceProvider) {}

    public async evaluate(request: GovernanceRequest): Promise<boolean> {
        return this.provider.evaluatePolicy(request);
    }
}
