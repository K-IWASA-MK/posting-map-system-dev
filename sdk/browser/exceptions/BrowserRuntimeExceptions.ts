export class BrowserRuntimeException extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'BrowserRuntimeException';
  }
}

export class CDPConnectionException extends BrowserRuntimeException {
  constructor(message: string) {
    super(message, 'CDP_CONNECTION_ERROR');
    this.name = 'CDPConnectionException';
  }
}

export class ProfileViolationException extends BrowserRuntimeException {
  constructor(message: string) {
    super(message, 'PROFILE_VIOLATION');
    this.name = 'ProfileViolationException';
  }
}

export class SessionExpiredException extends BrowserRuntimeException {
  constructor(message: string) {
    super(message, 'SESSION_EXPIRED');
    this.name = 'SessionExpiredException';
  }
}

export class HealthCheckFailedException extends BrowserRuntimeException {
  constructor(message: string) {
    super(message, 'HEALTH_CHECK_FAILED');
    this.name = 'HealthCheckFailedException';
  }
}

export class EvidenceCollectionFailedException extends BrowserRuntimeException {
  constructor(message: string) {
    super(message, 'EVIDENCE_COLLECTION_FAILED');
    this.name = 'EvidenceCollectionFailedException';
  }
}
