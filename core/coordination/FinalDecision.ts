import { DecisionPlan } from "./DecisionPlan";
import { DecisionReason } from "./DecisionReason";

export interface FinalDecision {
  readonly decisionId: string;
  readonly traceId: string;
  readonly plan: DecisionPlan;
  readonly reason: DecisionReason;
  readonly timestamp: number;
}
