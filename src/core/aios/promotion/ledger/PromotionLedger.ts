export class LedgerBase {
  protected entries: any[] = [];
  public append(entry: any): void {
    this.entries.push({ ...entry, timestamp: new Date() });
  }
  public getEntries(): any[] {
    return [...this.entries];
  }
}

export class PromotionLedger extends LedgerBase {}
export class MergeLedger extends LedgerBase {}
export class ConflictLedger extends LedgerBase {}
export class VersionLedger extends LedgerBase {}
export class LineageLedger extends LedgerBase {}
export class AuditLedger extends LedgerBase {}
export class CandidateLedger extends LedgerBase {}
export class KnowledgeLedger extends LedgerBase {}
