import { ExecutionJob } from '../models/ExecutionJob';
import { JobSchedule } from '../models/JobSchedule';
import { JobStep } from '../models/JobStep';
import { RuntimeLock } from '../models/RuntimeLock';

export interface IOrchestrationProvider {
    resolveDependencies(job: ExecutionJob): Promise<JobStep[]>;
    scheduleJob(job: ExecutionJob, steps: JobStep[]): Promise<JobSchedule>;
    acquireLock(jobId: string, targetRuntime: string): Promise<RuntimeLock>;
    releaseLock(lock: RuntimeLock): Promise<void>;
    dispatchExecution(job: ExecutionJob, steps: JobStep[]): Promise<boolean>;
}
