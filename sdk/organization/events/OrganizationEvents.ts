import { DepartmentNode } from '../types/DepartmentNode';
import { DelegationScope } from '../types/DelegationScope';

export interface OrganizationEvent {
  type: string;
  timestamp: string;
  payload: any;
}

export class OrganizationCreatedEvent implements OrganizationEvent {
  type = 'OrganizationCreated';
  timestamp = new Date().toISOString();
  constructor(public payload: { organizationId: string; name: string }) {}
}

export class DepartmentCreatedEvent implements OrganizationEvent {
  type = 'DepartmentCreated';
  timestamp = new Date().toISOString();
  constructor(public payload: { node: DepartmentNode }) {}
}

export class AuthorityDelegatedEvent implements OrganizationEvent {
  type = 'AuthorityDelegated';
  timestamp = new Date().toISOString();
  constructor(public payload: { fromSupervisorId: string; toEmployeeId: string; scope: DelegationScope }) {}
}

export class SupervisorIntervenedEvent implements OrganizationEvent {
  type = 'SupervisorIntervened';
  timestamp = new Date().toISOString();
  constructor(public payload: { supervisorId: string; targetEmployeeId: string; action: string }) {}
}
