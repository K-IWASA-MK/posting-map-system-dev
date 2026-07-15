export interface JobStep {
    stepId: string;
    jobId: string;
    dependsOn: string[];
    preCondition: string;
    postCondition: string;
    rollbackPoint: string;
    timeout: number;
    retryLimit: number;
    estimatedDuration: number;
    requiredCapability: string;
    action: string;
    status: 'PENDING' | 'EXECUTING' | 'COMPLETED' | 'FAILED';
}
