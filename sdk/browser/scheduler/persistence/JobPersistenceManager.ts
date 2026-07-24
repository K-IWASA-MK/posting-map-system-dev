import { HumanAuthRequest } from '../types/HumanAuthRequest';

export interface PersistentState {
  scheduledJobIds: string[];
  pendingAuthRequests: HumanAuthRequest[];
  lastSavedAt: string;
}

export class JobPersistenceManager {
  private memoryStore: PersistentState = {
    scheduledJobIds: [],
    pendingAuthRequests: [],
    lastSavedAt: new Date().toISOString()
  };

  public saveState(jobIds: string[], authRequests: HumanAuthRequest[]): void {
    this.memoryStore = {
      scheduledJobIds: jobIds,
      pendingAuthRequests: authRequests,
      lastSavedAt: new Date().toISOString()
    };
  }

  public loadState(): PersistentState {
    return this.memoryStore;
  }
}
