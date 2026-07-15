import { IOrchestrationProvider } from '../providers/IOrchestrationProvider';
import { RuntimeLock } from '../models/RuntimeLock';

export class RuntimeLockService {
    constructor(private provider: IOrchestrationProvider) {}

    public async lock(jobId: string, targetRuntime: string): Promise<RuntimeLock> {
        return this.provider.acquireLock(jobId, targetRuntime);
    }

    public async unlock(lock: RuntimeLock): Promise<void> {
        return this.provider.releaseLock(lock);
    }
}
