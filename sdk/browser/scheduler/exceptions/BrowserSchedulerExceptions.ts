export class BrowserSchedulerException extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'BrowserSchedulerException';
  }
}

export class JobAlreadyExistsException extends BrowserSchedulerException {
  constructor(message: string) {
    super(message, 'JOB_ALREADY_EXISTS');
    this.name = 'JobAlreadyExistsException';
  }
}

export class JobNotFoundException extends BrowserSchedulerException {
  constructor(message: string) {
    super(message, 'JOB_NOT_FOUND');
    this.name = 'JobNotFoundException';
  }
}

export class HumanAuthTimeoutException extends BrowserSchedulerException {
  constructor(message: string) {
    super(message, 'HUMAN_AUTH_TIMEOUT');
    this.name = 'HumanAuthTimeoutException';
  }
}
