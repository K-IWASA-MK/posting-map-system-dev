export enum RepositoryHealthStatus {
  HEALTHY = 'HEALTHY',
  WARNING = 'WARNING',
  DEGRADED = 'DEGRADED',
  ERROR = 'ERROR',
  UNKNOWN = 'UNKNOWN'
}

export interface RepositoryHealth {
  status: RepositoryHealthStatus;
  gitHubStatus: RepositoryHealthStatus;
  gitStatus: RepositoryHealthStatus;
  networkStatus: RepositoryHealthStatus;
  authStatus: RepositoryHealthStatus;
  lastCheckedAt: string;
  issues: string[];
}
