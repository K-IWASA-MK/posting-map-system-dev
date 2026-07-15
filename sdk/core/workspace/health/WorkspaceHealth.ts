export enum WorkspaceHealthStatus {
  HEALTHY = 'HEALTHY',
  WARNING = 'WARNING',
  DEGRADED = 'DEGRADED',
  ERROR = 'ERROR',
  UNKNOWN = 'UNKNOWN'
}

export interface WorkspaceHealth {
  status: WorkspaceHealthStatus;
  fsStatus: WorkspaceHealthStatus; // File system access/integrity
  dependencyStatus: WorkspaceHealthStatus; // Internal dependency resolution
  lastCheckedAt: string;
  issues: string[];
}
