import { IRuntimeEventBus } from '../runtime-event-bus/IRuntimeEventBus';
import { Subscription } from '../runtime-event-bus/Subscription';

/**
 * RuntimeSchedulerEventHandler monitors session termination signals to free execution slots.
 */
export class RuntimeSchedulerEventHandler {
  private readonly subscription: Subscription;

  constructor(eventBus: IRuntimeEventBus, onSlotReleased: () => void) {
    this.subscription = eventBus.subscribeAll((event) => {
      if (
        event.type === 'SESSION_COMPLETED' ||
        event.type === 'SESSION_FAILED' ||
        event.type === 'SESSION_TERMINATED'
      ) {
        onSlotReleased();
      }
    });
  }

  /**
   * Releases subscription registration to prevent memory leaks.
   */
  public stop(): void {
    this.subscription.unsubscribe();
  }
}
