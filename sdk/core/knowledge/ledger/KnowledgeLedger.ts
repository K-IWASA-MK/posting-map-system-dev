export interface KnowledgeLedgerEntry {
    entryId: string;
    knowledgeId: string;
    action: string; // e.g., 'CREATED', 'EVOLVED', 'VALIDATED'
    timestamp: string;
    metadata?: Record<string, any>;
}

export class KnowledgeLedger {
    private entries: KnowledgeLedgerEntry[] = [];

    public append(entry: KnowledgeLedgerEntry): void {
        this.entries.push(entry);
    }

    public getEntries(knowledgeId?: string): KnowledgeLedgerEntry[] {
        if (knowledgeId) {
            return this.entries.filter(e => e.knowledgeId === knowledgeId);
        }
        return this.entries;
    }
}
