import { RuntimeMonitoringSnapshot } from './RuntimeMonitoringSnapshot';

/**
 * IRuntimeMonitoringService defines the contract for compiling runtime metrics snapshots.
 */
export interface IRuntimeMonitoringService {
  /**
   * Compiles the static metadata snapshot of current counters.
   */
  getSnapshot(): RuntimeMonitoringSnapshot;

  /**
   * Resets all internal counters.
   */
  reset(): void;

  /**
   * Safe cleanup of event subscriptions.
   */
  stop(): void;
}
