import { RepositoryManifest } from './RepositoryManifest';
import { RepositoryState } from './RepositoryState';
import { RepositoryHealth } from './RepositoryHealth';
import { RepositoryMetrics } from './RepositoryMetrics';

export interface RepositoryExecutionHistory {
  lastEventId: string;
  provisionedAt?: string;
  lastSyncedAt?: string;
}

export interface RepositoryRecord {
  id: string; // Typically the repositoryName or a UUID
  manifest: RepositoryManifest;
  state: RepositoryState;
  health: RepositoryHealth;
  metrics: RepositoryMetrics;
  history: RepositoryExecutionHistory;
}
