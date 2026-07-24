export interface EmployeeSession {
  sessionId: string;
  employeeId: string;
  startedAt: string;
  browserSessionId?: string;
  currentTaskId?: string;
  active: boolean;
}
