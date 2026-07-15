export interface ExecutionLedgerMetadata {
  readonly schemaVersion: string;
  readonly ledgerVersion: string; // Enables Ledger replay across AIOS versions
  readonly runtime: string;
  readonly toolVersion: string;
  readonly project: string;
  readonly generatedAt: string;
}
