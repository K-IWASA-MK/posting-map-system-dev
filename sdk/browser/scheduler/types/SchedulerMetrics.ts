export interface SchedulerMetrics {
  runningJobs: number;
  waitingJobs: number;
  pausedJobs: number;
  authWaitingJobs: number;
  missedJobs: number;
  resumeCount: number;
  averageTriggerDelayMs: number;
}
