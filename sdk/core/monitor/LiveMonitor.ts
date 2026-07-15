import { MonitorRegistry } from './MonitorRegistry';
import { MonitorSnapshot } from './MonitorSnapshot';
import { SnapshotBuilder } from './SnapshotBuilder';

export class LiveMonitor {
  private registry: MonitorRegistry;
  
  private lastSnapshot: MonitorSnapshot | null = null;
  private currentVersion: number = 0;

  constructor(registry: MonitorRegistry) {
    this.registry = registry;
  }

  public async snapshot(): Promise<MonitorSnapshot> {
    const results: Record<string, any> = {};

    const services = this.registry.getAll();
    for (const service of services) {
      results[service.name()] = await service.query();
    }

    // Compare with the last snapshot (value check) to increment version only when data changes
    const currentSerialized = JSON.stringify(results);
    const lastSerialized = this.lastSnapshot ? JSON.stringify({
      health: this.lastSnapshot.health,
      sessions: this.lastSnapshot.sessions,
      metrics: this.lastSnapshot.metrics
    }) : '';

    if (currentSerialized !== lastSerialized) {
      this.currentVersion++;
    }

    const snapshot = SnapshotBuilder.build(results, this.currentVersion);
    this.lastSnapshot = snapshot;

    return snapshot;
  }
}
