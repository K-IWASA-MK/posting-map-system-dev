import { ReleaseRecord } from '../ReleaseRegistry';

export interface ReleaseMetrics {
  versionCount: number;
  lastReleaseDurationMs: number;
  failedReleases: number;
  successfulReleases: number;
  lastMeasuredAt: string;
}

export class ReleaseMetricsCollector {
  public async collectMetrics(record: ReleaseRecord): Promise<ReleaseMetrics> {
    // Mock logic for collecting metrics. Would normally query Ledger or external systems.
    return {
      versionCount: 1,
      lastReleaseDurationMs: 1200,
      failedReleases: record.state === 'FAILED' ? 1 : 0,
      successfulReleases: record.state === 'PUBLISHED' ? 1 : 0,
      lastMeasuredAt: new Date().toISOString()
    };
  }
}
