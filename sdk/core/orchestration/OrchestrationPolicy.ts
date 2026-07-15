export interface OrchestrationPolicy {
    schedulingPolicy: {
        maxConcurrentJobs: number;
        queueStrategy: 'FIFO' | 'PRIORITY';
    };
    retryPolicy: {
        defaultMaxRetry: number;
        globalRetryLimit: number;
    };
    timeoutPolicy: {
        defaultJobTimeoutMs: number;
        defaultStepTimeoutMs: number;
    };
    concurrencyPolicy: {
        maxThreads: number;
    };
    lockPolicy: {
        lockAcquisitionTimeoutMs: number;
        defaultLockTTLMs: number;
    };
    dispatchPolicy: {
        allowedTargets: string[];
    };
}
