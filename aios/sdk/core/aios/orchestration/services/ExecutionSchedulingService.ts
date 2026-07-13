import { IOrchestrationProvider } from '../providers/IOrchestrationProvider';
import { ExecutionJob } from '../models/ExecutionJob';
import { JobStep } from '../models/JobStep';
import { JobSchedule } from '../models/JobSchedule';

export class ExecutionSchedulingService {
    constructor(private provider: IOrchestrationProvider) {}

    public async schedule(job: ExecutionJob, steps: JobStep[]): Promise<JobSchedule> {
        return this.provider.scheduleJob(job, steps);
    }
}
