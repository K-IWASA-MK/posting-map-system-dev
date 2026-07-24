export type ScheduleType = 'CRON' | 'INTERVAL' | 'ONESHOT';

export interface ScheduledJob {
  jobId: string;
  name: string;
  scheduleType: ScheduleType;
  cronExpression?: string; // e.g. "0 1 * * *"
  intervalMs?: number;    // e.g. 60000
  enabled: boolean;
  lastRunAt?: number;
  nextRunAt?: number;
  taskGenerator: () => any;
}
