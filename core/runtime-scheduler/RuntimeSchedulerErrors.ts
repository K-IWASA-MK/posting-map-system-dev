/**
 * SchedulerErrorCode represents scheduler boundary limitations.
 */
export type SchedulerErrorCode = 'SCHEDULER_QUEUE_FULL';

/**
 * SchedulerError is thrown when scheduler queues exceed their size constraints.
 */
export class SchedulerError extends Error {
  public readonly errorCode: SchedulerErrorCode;

  constructor(errorCode: SchedulerErrorCode, message: string) {
    super(`[${errorCode}] ${message}`);
    this.name = 'SchedulerError';
    this.errorCode = errorCode;
  }
}
