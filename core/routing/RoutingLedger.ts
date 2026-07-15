import { RoutingDecisionRecord } from "./RoutingDecisionRecord";
import { RoutingEvent } from "./RoutingEventBus";

export interface RoutingLedger {
  appendRouting(event: RoutingEvent): void;
}

export interface DecisionLedger {
  appendDecision(record: RoutingDecisionRecord): void;
}

export interface PolicyLedger {
  appendPolicyEvaluation(payload: any): void;
}

export interface HistoryLedger {
  appendHistory(payload: any): void;
}

export interface AuditLedger {
  appendAudit(tag: string, traceId: string, payload: any): void;
}
