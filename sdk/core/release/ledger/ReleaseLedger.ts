import { ReleaseLedgerEntryType } from './ReleaseLedgerEntryType';

export interface ReleaseLedgerEntry {
  entryId: string;
  releaseId: string;
  timestamp: string;
  entryType: ReleaseLedgerEntryType;
  payload: Record<string, unknown>;
}

export interface ReleaseLedger {
  record(entryType: ReleaseLedgerEntryType, payload: Record<string, unknown>): Promise<string>;
  getEntries(releaseId: string): Promise<ReleaseLedgerEntry[]>;
}

export class InMemoryReleaseLedger implements ReleaseLedger {
  private entries: ReleaseLedgerEntry[] = [];

  public async record(entryType: ReleaseLedgerEntryType, payload: Record<string, unknown>): Promise<string> {
    const entryId = `RLS-EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const releaseId = payload.releaseId as string || 'unknown';
    
    const entry: ReleaseLedgerEntry = {
      entryId,
      releaseId,
      timestamp: new Date().toISOString(),
      entryType,
      payload
    };
    this.entries.push(entry);
    return entryId;
  }

  public async getEntries(releaseId: string): Promise<ReleaseLedgerEntry[]> {
    return this.entries.filter(e => e.releaseId === releaseId);
  }
}
