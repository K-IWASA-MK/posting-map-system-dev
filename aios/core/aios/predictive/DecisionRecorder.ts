import { PredictionResultRecord } from "./PredictionResultRecord";
import { PredictionLedger } from "./PredictionLedger";

export class DecisionRecorder {
  constructor(private ledger: PredictionLedger) {}

  public record(record: PredictionResultRecord): void {
    this.ledger.appendPrediction(record);
  }
}
