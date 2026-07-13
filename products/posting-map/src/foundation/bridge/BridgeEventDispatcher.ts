import { BridgeEvent } from './BridgeEvent';
import { BridgeListener } from './BridgeListener';

export class BridgeEventDispatcher {
  private static listeners: BridgeListener[] = [];

  public static addListener(listener: BridgeListener): void {
    if (!BridgeEventDispatcher.listeners.includes(listener)) {
      BridgeEventDispatcher.listeners.push(listener);
    }
  }

  public static removeListener(listener: BridgeListener): void {
    const idx = BridgeEventDispatcher.listeners.indexOf(listener);
    if (idx !== -1) {
      BridgeEventDispatcher.listeners.splice(idx, 1);
    }
  }

  public static dispatch(event: BridgeEvent): void {
    for (const listener of BridgeEventDispatcher.listeners) {
      try {
        listener.onEvent(event);
      } catch (e) {
        // Silently log or handle dispatch observer error
      }
    }
  }

  public static clear(): void {
    BridgeEventDispatcher.listeners = [];
  }
}
