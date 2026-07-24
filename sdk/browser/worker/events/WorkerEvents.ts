import { LockScope } from '../types/LockScope';

export interface WorkerEvent {
  type: string;
  timestamp: string;
  payload: any;
}

export class TaskQueuedEvent implements WorkerEvent {
  type = 'TaskQueued';
  timestamp = new Date().toISOString();
  constructor(public payload: { taskId: string; agentId: string; priority: string }) {}
}

export class TaskStartedEvent implements WorkerEvent {
  type = 'TaskStarted';
  timestamp = new Date().toISOString();
  constructor(public payload: { taskId: string; agentId: string }) {}
}

export class TaskCompletedEvent implements WorkerEvent {
  type = 'TaskCompleted';
  timestamp = new Date().toISOString();
  constructor(public payload: { taskId: string; agentId: string; durationMs: number }) {}
}

export class TaskFailedEvent implements WorkerEvent {
  type = 'TaskFailed';
  timestamp = new Date().toISOString();
  constructor(public payload: { taskId: string; agentId: string; error: string }) {}
}

export class LockAcquiredEvent implements WorkerEvent {
  type = 'LockAcquired';
  timestamp = new Date().toISOString();
  constructor(public payload: { scope: LockScope; targetKey: string; ownerAgentId: string }) {}
}

export class LockReleasedEvent implements WorkerEvent {
  type = 'LockReleased';
  timestamp = new Date().toISOString();
  constructor(public payload: { scope: LockScope; targetKey: string; ownerAgentId: string }) {}
}

export class TaskTimedOutEvent implements WorkerEvent {
  type = 'TaskTimedOut';
  timestamp = new Date().toISOString();
  constructor(public payload: { taskId: string; agentId: string; timeoutMs: number }) {}
}

export class DeadlockRecoveredEvent implements WorkerEvent {
  type = 'DeadlockRecovered';
  timestamp = new Date().toISOString();
  constructor(public payload: { scope: LockScope; targetKey: string; staleAgentId: string }) {}
}
