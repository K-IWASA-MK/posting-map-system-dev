export interface AuditContext {
  auditId: string;
  runtimeId: string;
  phase: string;
  targetLayer: string;
  correlationId: string;
  timestamp: string;
}
