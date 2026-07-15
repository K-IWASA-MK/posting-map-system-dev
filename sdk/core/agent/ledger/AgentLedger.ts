import { DecisionRecord } from '../DecisionRecord';

export interface AgentLedgerEntry {
    entryId: string;
    agentId: string;
    contextId: string;
    action: string;
    timestamp: string;
    metadata?: Record<string, any>;
}

export class AgentLedger {
    private entries: AgentLedgerEntry[] = [];
    private decisions: DecisionRecord[] = [];

    public appendEntry(entry: AgentLedgerEntry): void {
        this.entries.push(entry);
    }

    public appendDecision(decision: DecisionRecord): void {
        this.decisions.push(decision);
    }

    public getEntries(): AgentLedgerEntry[] {
        return this.entries;
    }

    public getDecisions(): DecisionRecord[] {
        return this.decisions;
    }
}
