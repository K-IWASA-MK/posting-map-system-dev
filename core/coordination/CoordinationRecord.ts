import { FinalDecision } from "./FinalDecision";
import { DelegationPlan } from "./DelegationPlan";

export interface CoordinationRecord {
  readonly id: string;
  readonly traceId: string;
  readonly decision: FinalDecision;
  readonly delegation: DelegationPlan;
  readonly executedAt: number;
}
