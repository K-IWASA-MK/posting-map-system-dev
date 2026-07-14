import { PolicyUpdateRecord } from "./PolicyUpdateRecord";
import { PolicyLedger } from "./PolicyLedger";

export class DecisionRecorder {
  constructor(private ledger: PolicyLedger) {}

  public recordUpdate(record: PolicyUpdateRecord): void {
    this.ledger.appendUpdate(record);
  }
}
