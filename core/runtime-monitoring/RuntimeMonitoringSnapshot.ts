/**
 * RuntimeMonitoringSnapshot provides an immutable snapshot of all runtime performance states.
 */
export interface RuntimeMonitoringSnapshot {
  readonly timestamp: number;

  readonly activeSessionsCount: number;
  readonly totalLaunches: number;
  readonly totalCompleted: number;
  readonly totalFailed: number;
  readonly permissionDenials: number;
  readonly workspaceLocksBlocked: number;

  // Reserved for G7
  readonly totalPluginsExecuted: number;
  readonly totalRuntimeErrors: number;
  readonly totalWorkspacePrepared: number;
  readonly uptimeMs: number;
}
