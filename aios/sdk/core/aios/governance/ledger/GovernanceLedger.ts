export interface LedgerEntry {
    entryId: string;
    sessionId: string;
    timestamp: string;
    action: string;
    details: any;
}

export class GovernanceLedger {
    private decisionLedger: LedgerEntry[] = [];
    private complianceLedger: LedgerEntry[] = [];
    private impactLedger: LedgerEntry[] = [];
    private policyLedger: LedgerEntry[] = [];
    private isolationLedger: LedgerEntry[] = [];
    private auditLedger: LedgerEntry[] = [];

    public appendDecision(entry: LedgerEntry) { this.decisionLedger.push(entry); this.appendAudit(entry); }
    public appendCompliance(entry: LedgerEntry) { this.complianceLedger.push(entry); this.appendAudit(entry); }
    public appendImpact(entry: LedgerEntry) { this.impactLedger.push(entry); this.appendAudit(entry); }
    public appendPolicy(entry: LedgerEntry) { this.policyLedger.push(entry); this.appendAudit(entry); }
    public appendIsolation(entry: LedgerEntry) { this.isolationLedger.push(entry); this.appendAudit(entry); }
    private appendAudit(entry: LedgerEntry) { this.auditLedger.push(entry); }

    public getLedgers() {
        return {
            decision: this.decisionLedger,
            compliance: this.complianceLedger,
            impact: this.impactLedger,
            policy: this.policyLedger,
            isolation: this.isolationLedger,
            audit: this.auditLedger
        };
    }
}
