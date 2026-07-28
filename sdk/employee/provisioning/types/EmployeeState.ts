/**
 * EmployeeState.ts
 * 
 * Full lifecycle states for AI Employees
 */

export enum EmployeeState {
  PROVISIONING = 'PROVISIONING',
  IDLE = 'IDLE',
  WAITING = 'WAITING',
  ASSIGNED = 'ASSIGNED',
  RUNNING = 'RUNNING',
  VERIFYING = 'VERIFYING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  OFFLINE = 'OFFLINE',
  SUSPENDED = 'SUSPENDED'
}
