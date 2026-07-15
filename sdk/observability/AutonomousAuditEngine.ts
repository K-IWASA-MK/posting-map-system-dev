import { AuditContext } from "./AuditContext";
import { AuditResult } from "./AuditResult";

export interface IAutonomousAuditEngine {
  runAudit(context: AuditContext): Promise<AuditResult>;
  validateLayer(layer: string, context: AuditContext): Promise<AuditResult>;
  checkIntegrity(context: AuditContext): Promise<AuditResult>;
  generateReport(results: AuditResult[]): Promise<Record<string, any>>;
}

export abstract class BaseAutonomousAuditEngine implements IAutonomousAuditEngine {
  abstract runAudit(context: AuditContext): Promise<AuditResult>;
  abstract validateLayer(layer: string, context: AuditContext): Promise<AuditResult>;
  abstract checkIntegrity(context: AuditContext): Promise<AuditResult>;
  abstract generateReport(results: AuditResult[]): Promise<Record<string, any>>;
}
