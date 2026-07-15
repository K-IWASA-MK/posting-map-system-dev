import { PolicyUpdateRecord } from "./PolicyUpdateRecord";
import { PolicyRecommendation } from "./PolicyRecommendation";
import { ConflictResolution } from "./PolicyConflictResolver";
import { PolicyVersion } from "./PolicyVersion";

export interface PolicyLedger {
  appendUpdate(record: PolicyUpdateRecord): void;
}

export interface RuleLedger {
  appendRuleEvaluation(traceId: string, ruleId: string, result: boolean): void;
}

export interface ConflictLedger {
  appendConflictResolution(traceId: string, resolution: ConflictResolution): void;
}

export interface RecommendationLedger {
  appendRecommendation(traceId: string, recommendation: PolicyRecommendation): void;
}

export interface VersionLedger {
  appendVersion(version: PolicyVersion): void;
}

export interface AuditLedger {
  appendAudit(tag: string, traceId: string, payload: any): void;
}
