/**
 * ILedgerEntryIdProvider abstracts unique log entry identifier generation.
 */
export interface ILedgerEntryIdProvider {
  /**
   * Generates a unique log entry identifier.
   */
  generateEntryId(): string;
}
