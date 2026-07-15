import { IOrchestrationProvider } from '../providers/IOrchestrationProvider';
import { ExecutionJob } from '../models/ExecutionJob';
import { JobStep } from '../models/JobStep';

export class DependencyResolutionService {
    constructor(private provider: IOrchestrationProvider) {}

    public async resolve(job: ExecutionJob): Promise<JobStep[]> {
        return this.provider.resolveDependencies(job);
    }
}
