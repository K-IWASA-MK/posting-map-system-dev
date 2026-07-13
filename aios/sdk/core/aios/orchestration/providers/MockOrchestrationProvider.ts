import { IOrchestrationProvider } from './IOrchestrationProvider';
import { ExecutionJob } from '../models/ExecutionJob';
import { JobSchedule } from '../models/JobSchedule';
import { JobStep } from '../models/JobStep';
import { RuntimeLock } from '../models/RuntimeLock';
import crypto from 'crypto';

export class MockOrchestrationProvider implements IOrchestrationProvider {
    public async resolveDependencies(job: ExecutionJob): Promise<JobStep[]> {
        // Mock step generation
        return job.steps.map((stepStr, idx) => ({
            stepId: crypto.randomUUID(),
            jobId: job.jobId,
            dependsOn: idx > 0 ? [`step-${idx - 1}`] : [],
            preCondition: 'valid',
            postCondition: 'valid',
            rollbackPoint: 'none',
            timeout: 5000,
            retryLimit: 3,
            estimatedDuration: 1000,
            requiredCapability: 'CAN_EXECUTE',
            action: stepStr,
            status: 'PENDING'
        }));
    }

    public async scheduleJob(job: ExecutionJob, steps: JobStep[]): Promise<JobSchedule> {
        return {
            scheduleId: crypto.randomUUID(),
            jobId: job.jobId,
            scheduledStartTime: new Date().toISOString(),
            estimatedEndTime: new Date(Date.now() + 60000).toISOString(),
            allocatedResources: ['mock-cpu-1'],
            queuePosition: 1,
            status: 'SCHEDULED'
        };
    }

    public async acquireLock(jobId: string, targetRuntime: string): Promise<RuntimeLock> {
        return {
            lockId: crypto.randomUUID(),
            lockOwner: jobId,
            lockScope: 'GLOBAL',
            lockType: 'EXCLUSIVE',
            acquiredAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 300000).toISOString(),
            renewable: true,
            targetRuntime
        };
    }

    public async releaseLock(lock: RuntimeLock): Promise<void> {
        return Promise.resolve();
    }

    public async dispatchExecution(job: ExecutionJob, steps: JobStep[]): Promise<boolean> {
        // Simulate execution failure if priority is 'FAIL'
        if (job.priority === 'FAIL') {
            return false;
        }
        return true;
    }
}
