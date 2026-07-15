export enum AuditTag {
  AUDIT_GENERATION_G5 = "AUDIT-GENERATION:G5",
  AUDIT_SPRINT_X21 = "AUDIT-SPRINT:X-21",
  AUDIT_RUNTIME = "AUDIT-RUNTIME:AdaptiveRoutingRuntime",
  AUDIT_CHANGE_NEW = "AUDIT-CHANGE:NEW",
  AUDIT_RISK_LOW = "AUDIT-RISK:LOW",
  AUDIT_VERIFIED_YES = "AUDIT-VERIFIED:YES"
}

export function createAuditTrace(traceId: string): string {
  return `AUDIT-TRACE:${traceId}`;
}
