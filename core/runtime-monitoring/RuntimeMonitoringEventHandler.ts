import { RuntimeEvent } from '../runtime-event-bus/RuntimeEvent';
import { RuntimeEventType } from '../runtime-event-bus/RuntimeEventType';
import { RuntimeMonitoringCounters } from './RuntimeMonitoringCounters';

/**
 * RuntimeMonitoringEventHandler routes incoming bus events to updates on the counters object.
 * Avoids switch-case logic blocks using type handlers map.
 */
export class RuntimeMonitoringEventHandler {
  private readonly handlers = new Map<
    RuntimeEventType,
    (event: RuntimeEvent<any>, counters: RuntimeMonitoringCounters) => void
  >();

  constructor() {
    this.initializeHandlers();
  }

  /**
   * Routes the incoming event package to increment metrics.
   * @param event Structured runtime event package.
   * @param counters Mutable target counters.
   */
  public handle(event: RuntimeEvent<any>, counters: RuntimeMonitoringCounters): void {
    const handler = this.handlers.get(event.type);
    if (handler) {
      handler(event, counters);
    }
  }

  private initializeHandlers(): void {
    this.handlers.set('LAUNCH_REQUESTED', (event, counters) => {
      counters.totalLaunches++;
    });

    this.handlers.set('SESSION_ACTIVE', (event, counters) => {
      counters.activeSessionsCount++;
    });

    this.handlers.set('SESSION_COMPLETED', (event, counters) => {
      if (counters.activeSessionsCount > 0) {
        counters.activeSessionsCount--;
      }
      counters.totalCompleted++;
    });

    this.handlers.set('SESSION_FAILED', (event, counters) => {
      if (counters.activeSessionsCount > 0) {
        counters.activeSessionsCount--;
      }
      counters.totalFailed++;
    });

    this.handlers.set('SESSION_TERMINATED', (event, counters) => {
      if (counters.activeSessionsCount > 0) {
        counters.activeSessionsCount--;
      }
      counters.totalFailed++;
    });

    this.handlers.set('WORKSPACE_PREPARED', (event, counters) => {
      counters.totalWorkspacePrepared++;
    });

    this.handlers.set('WORKSPACE_LOCKED', (event, counters) => {
      counters.workspaceLocksBlocked++;
    });

    this.handlers.set('PLUGIN_EXECUTED', (event, counters) => {
      counters.totalPluginsExecuted++;
    });

    this.handlers.set('PLUGIN_PERMISSION_DENIED', (event, counters) => {
      counters.permissionDenials++;
    });
  }
}
