import { IOrchestrationProvider } from '../providers/IOrchestrationProvider';
import { ExecutionJob } from '../models/ExecutionJob';
import { JobStep } from '../models/JobStep';

export class ExecutionOrchestrationService {
    constructor(private provider: IOrchestrationProvider) {}

    public async dispatch(job: ExecutionJob, steps: JobStep[]): Promise<boolean> {
        return this.provider.dispatchExecution(job, steps);
    }
}
