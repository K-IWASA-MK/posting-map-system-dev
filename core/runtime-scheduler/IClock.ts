/**
 * IClock abstracts Date and time retrieval for testing, simulation, and replay.
 */
export interface IClock {
  /**
   * Returns current epoch millisecond timestamp.
   */
  now(): number;
}
