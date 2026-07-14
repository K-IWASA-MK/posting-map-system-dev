export enum AuditTag {
  AUDIT_GENERATION_G5 = "AUDIT-GENERATION:G5",
  AUDIT_SPRINT_X23 = "AUDIT-SPRINT:X-23",
  AUDIT_RUNTIME = "AUDIT-RUNTIME:AdaptivePolicyRuntime",
  AUDIT_CHANGE_NEW = "AUDIT-CHANGE:NEW",
  AUDIT_RISK_LOW = "AUDIT-RISK:LOW",
  AUDIT_VERIFIED_YES = "AUDIT-VERIFIED:YES"
}

export function createAuditTrace(traceId: string): string {
  return `AUDIT-TRACE:${traceId}`;
}
