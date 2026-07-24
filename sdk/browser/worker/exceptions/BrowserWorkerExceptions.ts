export class BrowserWorkerException extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'BrowserWorkerException';
  }
}

export class LockAcquisitionFailedException extends BrowserWorkerException {
  constructor(message: string) {
    super(message, 'LOCK_ACQUISITION_FAILED');
    this.name = 'LockAcquisitionFailedException';
  }
}

export class WorkerQueueOverflowException extends BrowserWorkerException {
  constructor(message: string) {
    super(message, 'QUEUE_OVERFLOW');
    this.name = 'WorkerQueueOverflowException';
  }
}

export class WorkerTaskTimeoutException extends BrowserWorkerException {
  constructor(message: string) {
    super(message, 'TASK_TIMEOUT');
    this.name = 'WorkerTaskTimeoutException';
  }
}
