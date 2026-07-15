export interface RetryProfile {
    profileId: string;
    jobId: string;
    stepId?: string;
    retryCount: number;
    maxRetry: number;
    backoffStrategy: 'LINEAR' | 'EXPONENTIAL' | 'CONSTANT';
    retryDelay: number;
    retryReason: string;
    lastFailure: string;
    retryPolicyId: string;
}
