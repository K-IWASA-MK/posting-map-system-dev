export class AIEmployeeException extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AIEmployeeException';
  }
}

export class EmployeeAlreadyExistsException extends AIEmployeeException {
  constructor(message: string) {
    super(message, 'EMPLOYEE_ALREADY_EXISTS');
    this.name = 'EmployeeAlreadyExistsException';
  }
}

export class EmployeeNotFoundException extends AIEmployeeException {
  constructor(message: string) {
    super(message, 'EMPLOYEE_NOT_FOUND');
    this.name = 'EmployeeNotFoundException';
  }
}

export class EmployeePolicyViolationException extends AIEmployeeException {
  constructor(message: string) {
    super(message, 'EMPLOYEE_POLICY_VIOLATION');
    this.name = 'EmployeePolicyViolationException';
  }
}
