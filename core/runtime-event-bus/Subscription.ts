/**
 * Subscription defines the interface for clean lifecycle release of event listeners.
 */
export interface Subscription {
  /**
   * Unregisters the listener callback from the event bus.
   */
  unsubscribe(): void;
}
