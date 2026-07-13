import { DecisionRecord } from "./DecisionRecord";
import { OptimizationLedger } from "./OptimizationLedger";

export class DecisionRecorder {
  constructor(private ledger: OptimizationLedger) {}

  public record(decision: DecisionRecord): void {
    this.ledger.appendDecision(decision);
  }
}
