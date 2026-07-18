import { ExecutionRecord, ExecutionState, ExecutionLedgerRegistry } from "../../../../../../sdk/ExecutionLedgerRegistry";
import { CapabilityRegistry, CapabilityCategory, CapabilityStatus } from "../../../../../../sdk/CapabilityRegistry";
import { SkillRegistry, SkillCategory, SkillStatus } from "../../../../../../sdk/SkillRegistry";
import { SkillPipelineRegistry, SkillPipelineStatus } from "../../../../../../sdk/SkillPipelineRegistry";
import { DashboardDataAuditEvent } from "./DashboardDataAuditEvent";

export interface AuditLedgerFormat {
  readonly executionId: string;
  readonly runtimeName: string;
  readonly sourceHash: string;
  readonly outputHash: string;
  readonly timestamp: string;
  readonly status: string;
  readonly schemaVersion: string;
}

export class ExecutionLedgerAdapter {
  /**
   * Converts a DashboardDataAuditEvent to a standard AIOS ExecutionRecord.
   * Maps executionId to `ledger-\d+` format and schemaVersion to semver tag to satisfy ExecutionLedgerValidator.
   */
  public static toExecutionRecord(event: DashboardDataAuditEvent): ExecutionRecord {
    // Generate a compliant ledger ID from the executionId hash
    const numericId = Math.abs(this.hashCode(event.executionId));
    const ledgerId = `ledger-${numericId}`;

    return {
      executionId: ledgerId,
      ledgerVersion: "1.0.0",
      description: `Dashboard Read Model Generation - ID: ${event.executionId}`,
      capabilityId: event.runtime.name,
      pipelineId: "DashboardAuditPublisher",
      skillIds: ["DashboardDataRuntime"],
      executionState: ExecutionState.COMPLETED,
      timestamp: event.timestamp,
      version: "1.0.0", // Maps schemaVersion 'v1' to standard semver format
      createdAt: event.timestamp,
      updatedAt: event.timestamp,
      auditTrail: [
        `originalExecutionId: ${event.executionId}`,
        `sourceHash: ${event.sourceHash}`,
        `outputHash: ${event.lineage.outputHash}`,
        `sources: ${event.lineage.sources.join(", ")}`
      ]
    };
  }

  /**
   * Converts a DashboardDataAuditEvent to the specific flat format requested.
   */
  public static toAuditLedgerFormat(event: DashboardDataAuditEvent): AuditLedgerFormat {
    return {
      executionId: event.executionId,
      runtimeName: event.runtime.name,
      sourceHash: event.sourceHash,
      outputHash: event.lineage.outputHash,
      timestamp: event.timestamp,
      status: "COMPLETED",
      schemaVersion: event.output.schemaVersion
    };
  }

  /**
   * Translates the audit event and registers it in the platform execution registry.
   * Resiliently registers capabilities, skills, and pipelines on-demand.
   */
  public static registerEvent(event: DashboardDataAuditEvent): void {
    this.ensureMetadataRegistered();
    const record = this.toExecutionRecord(event);
    ExecutionLedgerRegistry.register(record);
  }

  private static hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash = hash & hash;
    }
    return hash;
  }

  private static ensureMetadataRegistered(): void {
    const capabilityId = "DashboardDataRuntime";
    const pipelineId = "DashboardAuditPublisher";
    const skillId = "DashboardDataRuntime";

    // 1. Ensure Capability is registered
    if (!CapabilityRegistry.get(capabilityId)) {
      CapabilityRegistry.register({
        capabilityId,
        capabilityName: "Dashboard Data Generator Capability",
        category: CapabilityCategory.Implementation,
        description: "Translates active operations data into unified dashboard views",
        priority: 1,
        status: CapabilityStatus.ACTIVE,
        version: "1.0.0",
        supportedSkillIds: [skillId]
      });
    }

    // 2. Ensure Skill is registered
    if (!SkillRegistry.get(skillId)) {
      SkillRegistry.register({
        skillId,
        skillName: "Dashboard Data Generator Skill",
        category: SkillCategory.Transformation,
        description: "Executes read model conversion",
        capabilityId,
        priority: 1,
        status: SkillStatus.ACTIVE,
        version: "1.0.0"
      });
    }

    // 3. Ensure Skill Pipeline is registered
    if (!SkillPipelineRegistry.get(pipelineId)) {
      SkillPipelineRegistry.register({
        pipelineId,
        pipelineName: "Dashboard Audit Publisher Pipeline",
        description: "Audit tracking publisher for dashboard read models",
        capabilityId,
        skillIds: [skillId],
        priority: 1,
        status: SkillPipelineStatus.ACTIVE,
        version: "1.0.0",
        pipelineVersion: "1.0.0",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  }
}
