import { RoutingDecisionRecord } from "./RoutingDecisionRecord";
import { DecisionLedger } from "./RoutingLedger";

export class DecisionRecorder {
  constructor(private ledger: DecisionLedger) {}

  public record(decision: RoutingDecisionRecord): void {
    this.ledger.appendDecision(decision);
  }
}
