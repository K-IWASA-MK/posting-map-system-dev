import { IRuntimeMonitoringService } from './IRuntimeMonitoringService';
import { RuntimeMonitoringSnapshot } from './RuntimeMonitoringSnapshot';
import { RuntimeMonitoringCounters } from './RuntimeMonitoringCounters';
import { RuntimeMonitoringSnapshotFactory } from './RuntimeMonitoringSnapshotFactory';
import { RuntimeMonitoringEventHandler } from './RuntimeMonitoringEventHandler';
import { IRuntimeEventBus } from '../runtime-event-bus/IRuntimeEventBus';
import { Subscription } from '../runtime-event-bus/Subscription';

/**
 * RuntimeMonitoringService aggregates metrics by subscribing to the platform event bus.
 * Conforms to: observes only (no reverse publishing, no direct control mutations).
 */
export class RuntimeMonitoringService implements IRuntimeMonitoringService {
  private readonly counters = new RuntimeMonitoringCounters();
  private readonly eventHandler = new RuntimeMonitoringEventHandler();
  private readonly startTime: number;
  private readonly subscription: Subscription;

  constructor(eventBus: IRuntimeEventBus) {
    this.startTime = Date.now();
    this.subscription = eventBus.subscribeAll((event) => {
      this.eventHandler.handle(event, this.counters);
    });
  }

  /**
   * Compiles and returns the static snapshot of current metric aggregates.
   */
  public getSnapshot(): RuntimeMonitoringSnapshot {
    return RuntimeMonitoringSnapshotFactory.create(this.counters, this.startTime);
  }

  /**
   * Cleans metrics back to zero.
   */
  public reset(): void {
    this.counters.reset();
  }

  /**
   * Unsubscribes from the Event Bus stream.
   */
  public stop(): void {
    this.subscription.unsubscribe();
  }
}
