import { MonitorSnapshot } from './MonitorSnapshot';
import { MonitorStatus } from './MonitorStatus';

export class SnapshotBuilder {
  public static build(
    queryResults: Record<string, any>,
    version: number
  ): MonitorSnapshot {
    const healthData = queryResults['health'] || { status: MonitorStatus.UNKNOWN };
    const sessionsData = queryResults['sessions'] || { active: 0, completed: 0, failed: 0 };
    const metricsData = queryResults['metrics'] || {
      averageExecutionTime: 0,
      executionCount: 0,
      averageReviewConfidence: 0,
      pluginExecutionCount: 0
    };

    const baseSnapshot = {
      snapshotId: `SNAP-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      snapshotVersion: version,
      generatedAt: new Date().toISOString(),
      health: Object.freeze({ ...healthData }),
      sessions: Object.freeze({ ...sessionsData }),
      metrics: Object.freeze({ ...metricsData }),
      schemaVersion: '1.0.0'
    };

    // Dynamically composite other registered query keys for Open/Closed support
    const extraFields: Record<string, any> = {};
    for (const key of Object.keys(queryResults)) {
      if (key !== 'health' && key !== 'sessions' && key !== 'metrics') {
        extraFields[key] = Object.freeze({ ...queryResults[key] });
      }
    }

    return Object.freeze({
      ...baseSnapshot,
      ...extraFields
    }) as any;
  }
}
