import { AuditStatus } from "./AuditStatus";

export interface AuditResult {
  auditId: string;
  status: AuditStatus;
  findings: string[];
  violations: string[];
  warnings: string[];
  metadata: Record<string, any>;
}
