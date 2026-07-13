import { DecisionRecord } from "./DecisionRecord";
import { SimulationResult } from "./SimulationResult";

export interface OptimizationLedger {
  appendDecision(record: DecisionRecord): void;
  appendSimulation(result: SimulationResult): void;
  appendHistory(event: any): void;
  appendAudit(event: any): void;
}
