import { LedgerEntry } from './LedgerEntry';

/**
 * LedgerSerializer decouples raw string serialization formats from actual storage.
 */
export class LedgerSerializer {
  /**
   * Serializes a single entry to string.
   */
  public serialize(entry: LedgerEntry): string {
    return JSON.stringify(entry);
  }

  /**
   * Deserializes a string back to a structured entry.
   */
  public deserialize(serialized: string): LedgerEntry {
    return JSON.parse(serialized) as LedgerEntry;
  }
}
