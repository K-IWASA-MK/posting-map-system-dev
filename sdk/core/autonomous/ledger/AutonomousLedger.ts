export interface LedgerEntry {
    entryId: string;
    sessionId: string;
    timestamp: string;
    action: string;
    details: any;
}

export class AutonomousLedger {
    private proposalLedger: LedgerEntry[] = [];
    private executionLedger: LedgerEntry[] = [];
    private validationLedger: LedgerEntry[] = [];
    private rollbackLedger: LedgerEntry[] = [];
    private promotionLedger: LedgerEntry[] = [];
    private evolutionLedger: LedgerEntry[] = [];

    public appendProposal(entry: LedgerEntry) { this.proposalLedger.push(entry); }
    public appendExecution(entry: LedgerEntry) { this.executionLedger.push(entry); }
    public appendValidation(entry: LedgerEntry) { this.validationLedger.push(entry); }
    public appendRollback(entry: LedgerEntry) { this.rollbackLedger.push(entry); }
    public appendPromotion(entry: LedgerEntry) { this.promotionLedger.push(entry); }
    public appendEvolution(entry: LedgerEntry) { this.evolutionLedger.push(entry); }

    public getLedgers() {
        return {
            proposal: this.proposalLedger,
            execution: this.executionLedger,
            validation: this.validationLedger,
            rollback: this.rollbackLedger,
            promotion: this.promotionLedger,
            evolution: this.evolutionLedger
        };
    }
}
