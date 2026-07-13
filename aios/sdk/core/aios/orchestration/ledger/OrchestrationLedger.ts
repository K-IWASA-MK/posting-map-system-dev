export interface LedgerEntry {
    entryId: string;
    sessionId: string;
    timestamp: string;
    action: string;
    details: any;
}

export class OrchestrationLedger {
    private scheduleLedger: LedgerEntry[] = [];
    private executionLedger: LedgerEntry[] = [];
    private retryLedger: LedgerEntry[] = [];
    private lockLedger: LedgerEntry[] = [];
    private dispatchLedger: LedgerEntry[] = [];
    private contextLedger: LedgerEntry[] = [];
    private dependencyLedger: LedgerEntry[] = [];
    private auditLedger: LedgerEntry[] = [];

    public appendSchedule(entry: LedgerEntry) { this.scheduleLedger.push(entry); this.appendAudit(entry); }
    public appendExecution(entry: LedgerEntry) { this.executionLedger.push(entry); this.appendAudit(entry); }
    public appendRetry(entry: LedgerEntry) { this.retryLedger.push(entry); this.appendAudit(entry); }
    public appendLock(entry: LedgerEntry) { this.lockLedger.push(entry); this.appendAudit(entry); }
    public appendDispatch(entry: LedgerEntry) { this.dispatchLedger.push(entry); this.appendAudit(entry); }
    public appendContext(entry: LedgerEntry) { this.contextLedger.push(entry); this.appendAudit(entry); }
    public appendDependency(entry: LedgerEntry) { this.dependencyLedger.push(entry); this.appendAudit(entry); }
    
    private appendAudit(entry: LedgerEntry) { this.auditLedger.push(entry); }

    public getLedgers() {
        return {
            schedule: this.scheduleLedger,
            execution: this.executionLedger,
            retry: this.retryLedger,
            lock: this.lockLedger,
            dispatch: this.dispatchLedger,
            context: this.contextLedger,
            dependency: this.dependencyLedger,
            audit: this.auditLedger
        };
    }
}
