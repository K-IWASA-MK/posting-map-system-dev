import { AITaskManifest } from '../types/AITaskManifest';

export interface AssignmentEvent {
  type: string;
  timestamp: string;
  payload: any;
}

export class TaskCreatedEvent implements AssignmentEvent {
  type = 'TaskCreated';
  timestamp = new Date().toISOString();
  constructor(public payload: { task: AITaskManifest }) {}
}

export class TaskAssignedEvent implements AssignmentEvent {
  type = 'TaskAssigned';
  timestamp = new Date().toISOString();
  constructor(public payload: { taskId: string; employeeId: string; ownerId: string }) {}
}

export class TaskHandedOffEvent implements AssignmentEvent {
  type = 'TaskHandedOff';
  timestamp = new Date().toISOString();
  constructor(public payload: { taskId: string; fromEmployeeId: string; toEmployeeId: string }) {}
}

export class TaskReassignedEvent implements AssignmentEvent {
  type = 'TaskReassigned';
  timestamp = new Date().toISOString();
  constructor(public payload: { taskId: string; newEmployeeId: string; reason: string }) {}
}

export class TaskCompletedEvent implements AssignmentEvent {
  type = 'TaskCompleted';
  timestamp = new Date().toISOString();
  constructor(public payload: { taskId: string; completedBy: string }) {}
}
