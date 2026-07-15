/**
 * RuntimeLedgerMetrics maintains internal statistics of ledger write attempts and states.
 */
export class RuntimeLedgerMetrics {
  public totalEntries = 0;
  public writeFailures = 0;
  public successfulWrites = 0;
  public lastWriteTimestamp = 0;

  /**
   * Resets all counter metrics.
   */
  public reset(): void {
    this.totalEntries = 0;
    this.writeFailures = 0;
    this.successfulWrites = 0;
    this.lastWriteTimestamp = 0;
  }
}
