export interface MemoryLedgerEntry {
    entryId: string;
    memoryId: string;
    action: string;
    timestamp: string;
    metadata?: Record<string, any>;
}

export class MemoryLedger {
    private entries: MemoryLedgerEntry[] = [];

    public append(entry: MemoryLedgerEntry): void {
        this.entries.push(entry);
    }

    public getEntries(memoryId?: string): MemoryLedgerEntry[] {
        if (memoryId) {
            return this.entries.filter(e => e.memoryId === memoryId);
        }
        return this.entries;
    }
}
