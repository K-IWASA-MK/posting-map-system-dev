import { AuditResult } from "./AuditResult";

export class AuditRegistry {
  private audits: Map<string, AuditResult> = new Map();

  public async addAudit(result: AuditResult): Promise<boolean> {
    if (this.audits.has(result.auditId)) {
      return false;
    }
    this.audits.set(result.auditId, result);
    return true;
  }

  public async findAudit(id: string): Promise<AuditResult | null> {
    return this.audits.get(id) || null;
  }

  public async listAudits(): Promise<AuditResult[]> {
    return Array.from(this.audits.values());
  }

  public async removeAudit(id: string): Promise<boolean> {
    return this.audits.delete(id);
  }
}
