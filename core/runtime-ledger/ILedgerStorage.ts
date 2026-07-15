import { LedgerEntry } from './LedgerEntry';
import { LedgerStorageResult } from './LedgerStorageResult';
import { LedgerQueryFilter } from './LedgerQueryFilter';

/**
 * ILedgerStorage abstracts persistent storage engines for audit logs.
 */
export interface ILedgerStorage {
  /**
   * Appends a log entry. Returns storage status metadata.
   */
  append(entry: LedgerEntry): Promise<LedgerStorageResult>;

  /**
   * Queries stored log entries matching the filter settings.
   */
  query(filter?: LedgerQueryFilter): Promise<LedgerEntry[]>;
}
