export class AITaskAssignmentException extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AITaskAssignmentException';
  }
}

export class TaskDependencyUnmetException extends AITaskAssignmentException {
  constructor(message: string) {
    super(message, 'TASK_DEPENDENCY_UNMET');
    this.name = 'TaskDependencyUnmetException';
  }
}

export class MaxHandoffExceededException extends AITaskAssignmentException {
  constructor(message: string) {
    super(message, 'MAX_HANDOFF_EXCEEDED');
    this.name = 'MaxHandoffExceededException';
  }
}

export class NoEmployeeAvailableException extends AITaskAssignmentException {
  constructor(message: string) {
    super(message, 'NO_EMPLOYEE_AVAILABLE');
    this.name = 'NoEmployeeAvailableException';
  }
}
