import { BrowserRuntimeState } from '../types/BrowserRuntimeState';
import { RuntimeEvidenceModel } from '../types/RuntimeEvidenceModel';

export interface BrowserEvent {
  type: string;
  timestamp: string;
  payload: any;
}

export class BrowserConnectedEvent implements BrowserEvent {
  type = 'BrowserConnected';
  timestamp = new Date().toISOString();
  constructor(public payload: { cdpEndpoint: string; profileName: string }) {}
}

export class BrowserDisconnectedEvent implements BrowserEvent {
  type = 'BrowserDisconnected';
  timestamp = new Date().toISOString();
  constructor(public payload: { reason: string }) {}
}

export class PageOpenedEvent implements BrowserEvent {
  type = 'PageOpened';
  timestamp = new Date().toISOString();
  constructor(public payload: { url: string; title: string }) {}
}

export class NavigationCompletedEvent implements BrowserEvent {
  type = 'NavigationCompleted';
  timestamp = new Date().toISOString();
  constructor(public payload: { url: string; httpStatus: number; durationMs: number }) {}
}

export class HealthChangedEvent implements BrowserEvent {
  type = 'HealthChanged';
  timestamp = new Date().toISOString();
  constructor(public payload: { previousState: BrowserRuntimeState; currentState: BrowserRuntimeState; healthScore: number }) {}
}

export class EvidenceCollectedEvent implements BrowserEvent {
  type = 'EvidenceCollected';
  timestamp = new Date().toISOString();
  constructor(public payload: { evidenceId: string; evidence: RuntimeEvidenceModel }) {}
}

export class SessionExpiredEvent implements BrowserEvent {
  type = 'SessionExpired';
  timestamp = new Date().toISOString();
  constructor(public payload: { service: string; expiredAt: string }) {}
}
