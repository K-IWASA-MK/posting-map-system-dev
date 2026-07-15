import { LedgerEntry } from './LedgerEntry';
import { LedgerQueryFilter } from './LedgerQueryFilter';
import { RuntimeLedgerMetrics } from './RuntimeLedgerMetrics';

/**
 * IRuntimeLedger outlines public query options and metrics tracking for audit operations.
 */
export interface IRuntimeLedger {
  /**
   * Queries historical log entries matching filters.
   */
  query(filter?: LedgerQueryFilter): Promise<LedgerEntry[]>;

  /**
   * Returns internal write stats.
   */
  getMetrics(): RuntimeLedgerMetrics;

  /**
   * Resets local metrics.
   */
  reset(): void;

  /**
   * Disables subscription handlers.
   */
  stop(): void;
}
