import { MonitorRegistry } from './MonitorRegistry';
import { HealthMonitor } from './HealthMonitor';
import { SessionMonitor } from './SessionMonitor';
import { MetricsMonitor } from './MetricsMonitor';
import { LiveMonitor } from './LiveMonitor';
import { IProjectionRepository } from '../projection/IProjectionRepository';
import { IMetricsRepository } from '../metrics/IMetricsRepository';

export class MonitorFactory {
  public static create(
    projectionRepo: IProjectionRepository,
    metricsRepo: IMetricsRepository
  ): LiveMonitor {
    const registry = new MonitorRegistry();
    registry.register(new HealthMonitor(projectionRepo));
    registry.register(new SessionMonitor(projectionRepo));
    registry.register(new MetricsMonitor(metricsRepo));

    return new LiveMonitor(registry);
  }
}
