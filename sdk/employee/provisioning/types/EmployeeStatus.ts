/**
 * EmployeeStatus.ts
 * 
 * Mutable Runtime Status for AI Employees
 */

import { EmployeeState } from './EmployeeState';

export interface EmployeeStatus {
  employeeId: string;
  state: EmployeeState;
  lastHeartbeat: string;
  currentTask?: string;
  load: number; // 0.0 to 1.0
  lastExecution?: {
    taskId: string;
    completedAt: string;
    status: 'SUCCESS' | 'FAILED';
  };
}
