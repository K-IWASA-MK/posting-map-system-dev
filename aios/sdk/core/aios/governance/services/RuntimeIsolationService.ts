import { IGovernanceProvider } from '../providers/IGovernanceProvider';
import { GovernanceDecision } from '../models/GovernanceDecision';

export class RuntimeIsolationService {
    constructor(private provider: IGovernanceProvider) {}

    public async enforce(decision: GovernanceDecision): Promise<void> {
        return this.provider.enforceIsolation(decision);
    }
}
