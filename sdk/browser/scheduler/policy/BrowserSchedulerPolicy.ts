export class BrowserSchedulerPolicy {
  public static readonly MAX_CONCURRENT_JOBS = 5;
  public static readonly MAX_RUNNING_TIME_MS = 300000;
  public static readonly MISSED_JOB_POLICY = 'EXECUTE_IMMEDIATELY';
  public static readonly AUTH_WAIT_TIMEOUT_MS = 86400000; // 24 hours
  public static readonly HEALTH_CHECK_INTERVAL_MS = 60000; // 1 min

  public static isAuthRequestExpired(createdAt: number): boolean {
    return (Date.now() - createdAt) > BrowserSchedulerPolicy.AUTH_WAIT_TIMEOUT_MS;
  }
}
