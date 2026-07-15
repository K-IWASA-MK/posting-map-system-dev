import { IRuntimeEventBus } from '../runtime-event-bus/IRuntimeEventBus';
import { Subscription } from '../runtime-event-bus/Subscription';
import { RuntimeEvent } from '../runtime-event-bus/RuntimeEvent';

/**
 * RuntimeLedgerSubscriber manages Event Bus subscriptions for capturing audit trail streams.
 */
export class RuntimeLedgerSubscriber {
  private readonly subscription: Subscription;

  constructor(eventBus: IRuntimeEventBus, onEvent: (event: RuntimeEvent<any>) => void) {
    this.subscription = eventBus.subscribeAll((event) => {
      onEvent(event);
    });
  }

  /**
   * Releases subscription to prevent memory leaks.
   */
  public stop(): void {
    this.subscription.unsubscribe();
  }
}
