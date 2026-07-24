import { HumanAuthRequest } from '../types/HumanAuthRequest';

export interface SchedulerEvent {
  type: string;
  timestamp: string;
  payload: any;
}

export class SchedulerStartedEvent implements SchedulerEvent {
  type = 'SchedulerStarted';
  timestamp = new Date().toISOString();
  constructor(public payload: { startTime: string }) {}
}

export class SchedulerStoppedEvent implements SchedulerEvent {
  type = 'SchedulerStopped';
  timestamp = new Date().toISOString();
  constructor(public payload: { reason: string }) {}
}

export class SchedulerPausedEvent implements SchedulerEvent {
  type = 'SchedulerPaused';
  timestamp = new Date().toISOString();
  constructor(public payload: { reason: string }) {}
}

export class SchedulerResumedEvent implements SchedulerEvent {
  type = 'SchedulerResumed';
  timestamp = new Date().toISOString();
  constructor(public payload: { resumedAt: string }) {}
}

export class JobScheduledEvent implements SchedulerEvent {
  type = 'JobScheduled';
  timestamp = new Date().toISOString();
  constructor(public payload: { jobId: string; name: string }) {}
}

export class JobTriggeredEvent implements SchedulerEvent {
  type = 'JobTriggered';
  timestamp = new Date().toISOString();
  constructor(public payload: { jobId: string; delayMs: number }) {}
}

export class HumanAuthRequestedEvent implements SchedulerEvent {
  type = 'HumanAuthRequested';
  timestamp = new Date().toISOString();
  constructor(public payload: { request: HumanAuthRequest }) {}
}

export class HumanAuthCompletedEvent implements SchedulerEvent {
  type = 'HumanAuthCompleted';
  timestamp = new Date().toISOString();
  constructor(public payload: { requestId: string; agentId: string; completedAt: string }) {}
}

export class HumanAuthTimeoutEvent implements SchedulerEvent {
  type = 'HumanAuthTimeout';
  timestamp = new Date().toISOString();
  constructor(public payload: { requestId: string; agentId: string }) {}
}

export class HumanAuthCancelledEvent implements SchedulerEvent {
  type = 'HumanAuthCancelled';
  timestamp = new Date().toISOString();
  constructor(public payload: { requestId: string; agentId: string }) {}
}
