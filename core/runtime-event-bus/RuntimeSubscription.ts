import { Subscription } from './Subscription';

/**
 * RuntimeSubscription wraps a private callback removal routine.
 */
export class RuntimeSubscription implements Subscription {
  private readonly releaseFn: () => void;

  constructor(releaseFn: () => void) {
    this.releaseFn = releaseFn;
  }

  public unsubscribe(): void {
    this.releaseFn();
  }
}
