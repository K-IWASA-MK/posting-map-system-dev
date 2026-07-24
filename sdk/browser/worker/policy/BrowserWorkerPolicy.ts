import { WorkerQueueOverflowException } from '../exceptions/BrowserWorkerExceptions';

export class BrowserWorkerPolicy {
  public static readonly MAX_QUEUE_SIZE = 100;
  public static readonly MAX_EXECUTION_TIME_MS = 60000;
  public static readonly MAX_LOCK_TIME_MS = 30000;
  public static readonly MAX_RETRY_COUNT = 3;

  public static validateQueueCapacity(currentSize: number): void {
    if (currentSize >= BrowserWorkerPolicy.MAX_QUEUE_SIZE) {
      throw new WorkerQueueOverflowException(`Browser Task Queue overflow. Maximum capacity of ${BrowserWorkerPolicy.MAX_QUEUE_SIZE} reached.`);
    }
  }
}
