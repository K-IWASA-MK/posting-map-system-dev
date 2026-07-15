/**
 * ISessionIdProvider defines the abstraction for generating unique execution session IDs.
 */
export interface ISessionIdProvider {
  /**
   * Generates a unique string identifier.
   */
  generateSessionId(): string;
}
