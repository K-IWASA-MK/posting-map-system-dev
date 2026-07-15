/**
 * RuntimeMonitoringCounters aggregates mutable counts during the active lifecycle of the monitoring runtime.
 */
export class RuntimeMonitoringCounters {
  public activeSessionsCount = 0;
  public totalLaunches = 0;
  public totalCompleted = 0;
  public totalFailed = 0;
  public permissionDenials = 0;
  public workspaceLocksBlocked = 0;

  // Reserved for G7
  public totalPluginsExecuted = 0;
  public totalRuntimeErrors = 0;
  public totalWorkspacePrepared = 0;

  /**
   * Resets all internal values back to zero.
   */
  public reset(): void {
    this.activeSessionsCount = 0;
    this.totalLaunches = 0;
    this.totalCompleted = 0;
    this.totalFailed = 0;
    this.permissionDenials = 0;
    this.workspaceLocksBlocked = 0;
    this.totalPluginsExecuted = 0;
    this.totalRuntimeErrors = 0;
    this.totalWorkspacePrepared = 0;
  }
}
