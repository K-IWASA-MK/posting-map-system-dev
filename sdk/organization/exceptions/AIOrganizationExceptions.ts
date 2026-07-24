export class AIOrganizationException extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AIOrganizationException';
  }
}

export class AIOrganizationPolicyViolationException extends AIOrganizationException {
  constructor(message: string) {
    super(message, 'ORG_POLICY_VIOLATION');
    this.name = 'AIOrganizationPolicyViolationException';
  }
}

export class UnauthorizedDelegationException extends AIOrganizationException {
  constructor(message: string) {
    super(message, 'UNAUTHORIZED_DELEGATION');
    this.name = 'UnauthorizedDelegationException';
  }
}
