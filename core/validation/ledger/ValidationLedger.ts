export class ValidationLedger {
  private records: any[] = [];

  public append(record: any): void {
    this.records.push({
      ...record,
      timestamp: new Date().toISOString()
    });
  }

  public getRecords(): any[] {
    return [...this.records];
  }
}

export class EvidenceLedger extends ValidationLedger {}
export class ScoreLedger extends ValidationLedger {}
export class AggregationLedger extends ValidationLedger {}
export class PipelineLedger extends ValidationLedger {}
export class AuditLedger extends ValidationLedger {}
