export interface JobSchedule {
    scheduleId: string;
    jobId: string;
    scheduledStartTime: string;
    estimatedEndTime: string;
    allocatedResources: string[];
    queuePosition: number;
    status: 'PENDING' | 'SCHEDULED' | 'REJECTED';
}
