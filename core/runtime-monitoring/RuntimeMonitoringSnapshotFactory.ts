import { RuntimeMonitoringCounters } from './RuntimeMonitoringCounters';
import { RuntimeMonitoringSnapshot } from './RuntimeMonitoringSnapshot';

/**
 * RuntimeMonitoringSnapshotFactory converts mutable Counters class properties to an immutable RuntimeMonitoringSnapshot.
 */
export class RuntimeMonitoringSnapshotFactory {
  /**
   * Compiles the static metadata snapshot of the current counters.
   * @param counters The active mutable counters.
   * @param startTime Service bootstrap timestamp.
   */
  public static create(
    counters: RuntimeMonitoringCounters,
    startTime: number
  ): RuntimeMonitoringSnapshot {
    const now = Date.now();
    return {
      timestamp: now,
      activeSessionsCount: counters.activeSessionsCount,
      totalLaunches: counters.totalLaunches,
      totalCompleted: counters.totalCompleted,
      totalFailed: counters.totalFailed,
      permissionDenials: counters.permissionDenials,
      workspaceLocksBlocked: counters.workspaceLocksBlocked,
      totalPluginsExecuted: counters.totalPluginsExecuted,
      totalRuntimeErrors: counters.totalRuntimeErrors,
      totalWorkspacePrepared: counters.totalWorkspacePrepared,
      uptimeMs: now - startTime
    };
  }
}
