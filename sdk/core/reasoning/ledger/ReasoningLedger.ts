export interface ReasoningLedgerEntry {
    entryId: string;
    sessionId: string;
    action: string;
    timestamp: string;
    metadata?: Record<string, any>;
}

export class ReasoningLedger {
    private entries: ReasoningLedgerEntry[] = [];

    public append(entry: ReasoningLedgerEntry): void {
        this.entries.push(entry);
    }

    public getEntries(sessionId?: string): ReasoningLedgerEntry[] {
        if (sessionId) {
            return this.entries.filter(e => e.sessionId === sessionId);
        }
        return this.entries;
    }
}
