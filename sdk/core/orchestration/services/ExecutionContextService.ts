import { ExecutionJob } from '../models/ExecutionJob';

export class ExecutionContextService {
    public createContext(job: ExecutionJob): any {
        return {
            jobId: job.jobId,
            traceId: job.traceId,
            targetRuntime: job.targetRuntime,
            startTime: new Date().toISOString()
        };
    }
}
