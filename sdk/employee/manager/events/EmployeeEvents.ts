import { AIEmployeeIdentity } from '../types/AIEmployeeIdentity';
import { AIEmployeeState } from '../types/AIEmployeeState';
import { EmployeeHealth } from '../types/EmployeeHealth';

export interface EmployeeEvent {
  type: string;
  timestamp: string;
  payload: any;
}

export class EmployeeRegisteredEvent implements EmployeeEvent {
  type = 'EmployeeRegistered';
  timestamp = new Date().toISOString();
  constructor(public payload: { identity: AIEmployeeIdentity }) {}
}

export class EmployeeStateChangedEvent implements EmployeeEvent {
  type = 'EmployeeStateChanged';
  timestamp = new Date().toISOString();
  constructor(public payload: { employeeId: string; fromState: AIEmployeeState; toState: AIEmployeeState }) {}
}

export class EmployeeHealthChangedEvent implements EmployeeEvent {
  type = 'EmployeeHealthChanged';
  timestamp = new Date().toISOString();
  constructor(public payload: { employeeId: string; health: EmployeeHealth }) {}
}

export class EmployeeAuditEvent implements EmployeeEvent {
  type = 'EmployeeAudit';
  timestamp = new Date().toISOString();
  constructor(public payload: { action: string; employeeId: string; details: any }) {}
}
