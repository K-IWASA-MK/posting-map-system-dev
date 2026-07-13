export interface LedgerEntry {
  id: string;
  timestamp: Date;
  action: string;
  payload: any;
}

class BaseLedger {
  protected entries: LedgerEntry[] = [];

  append(action: string, payload: any): void {
    this.entries.push({
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
      action,
      payload
    });
  }

  getHistory(): LedgerEntry[] {
    return [...this.entries];
  }
}

export class EvolutionLedger extends BaseLedger {}
export class SimulationLedger extends BaseLedger {}
export class ApprovalLedger extends BaseLedger {}
export class StrategyLedger extends BaseLedger {}
export class HistoryLedger extends BaseLedger {}
export class AuditLedger extends BaseLedger {}
export class CandidateLedger extends BaseLedger {}
export class PlanLedger extends BaseLedger {}
