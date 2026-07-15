export interface LearningLedgerEntry {
    entryId: string;
    sessionId: string;
    action: string;
    timestamp: string;
    metadata?: Record<string, any>;
}

export class LearningLedger {
    private entries: LearningLedgerEntry[] = [];

    public append(entry: LearningLedgerEntry): void {
        this.entries.push(entry);
    }

    public getEntries(sessionId?: string): LearningLedgerEntry[] {
        if (sessionId) {
            return this.entries.filter(e => e.sessionId === sessionId);
        }
        return this.entries;
    }
}
