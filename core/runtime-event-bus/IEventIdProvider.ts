/**
 * IEventIdProvider defines the contract for compiling unique event IDs.
 */
export interface IEventIdProvider {
  /**
   * Generates a unique string identifier for events.
   */
  generateEventId(): string;
}
