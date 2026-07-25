/**
 * AIOS Employee Governance Enforcement Runtime Foundation
 * Integrated Enforcement Engine Implementation
 */

import { ApprovalGate } from './ApprovalGate';
import { ExecutionGate } from './ExecutionGate';
import { ToolGate } from './ToolGate';
import { IEmployeeGovernanceEnforcementEngine } from './contract/IEmployeeEnforcement';
import {
  EnforcementAuditRecord,
  EnforcementRecord,
  EnforcementRequest,
} from './models/EmployeeEnforcementModels';

export class EmployeeGovernanceEnforcementEngine implements IEmployeeGovernanceEnforcementEngine {
  private enforcements: Map<string, EnforcementRecord> = new Map();
  private auditLogs: EnforcementAuditRecord[] = [];
  private executionGate = new ExecutionGate();
  private toolGate = new ToolGate();
  private approvalGate = new ApprovalGate();

  public enforce(request: EnforcementRequest): EnforcementRecord {
    const timestamp = new Date().toISOString();
    const decision = request.decisionRecord;
    const enforcementId = `ENF-${decision.decisionId}-${Date.now()}`;

    // 1. Validate Execution Gate
    const execRes = this.executionGate.validateExecution(request);
    if (execRes.result === 'BLOCK') {
      return this.recordAndReturn(
        enforcementId,
        decision,
        'BLOCKED',
        'BLOCK',
        execRes.reason || '[Enforcement Engine] Execution Gate BLOCKED execution.',
        timestamp
      );
    }

    // 2. Validate Approval Gate
    const appRes = this.approvalGate.validateApproval(request);
    if (appRes.result === 'BLOCK') {
      return this.recordAndReturn(
        enforcementId,
        decision,
        'WAITING_APPROVAL',
        'BLOCK',
        appRes.reason || '[Enforcement Engine] Approval Gate BLOCKED execution.',
        timestamp
      );
    }

    // 3. Validate Tool Gate (Independent Validation)
    const toolRes = this.toolGate.validateToolExecution(request);
    if (toolRes.result === 'BLOCK') {
      return this.recordAndReturn(
        enforcementId,
        decision,
        'BLOCKED',
        'BLOCK',
        toolRes.reason || '[Enforcement Engine] Tool Gate BLOCKED execution.',
        timestamp
      );
    }

    // 4. All Gates PASS -> ALLOWED / EXECUTING
    return this.recordAndReturn(
      enforcementId,
      decision,
      'ALLOWED',
      'PASS',
      '[Enforcement Engine] All gates (Execution, Tool, Approval) passed cleanly. Execution permitted.',
      timestamp
    );
  }

  private recordAndReturn(
    enforcementId: string,
    decision: EnforcementRequest['decisionRecord'],
    status: EnforcementRecord['status'],
    gateResult: EnforcementRecord['gateResult'],
    blockedReason: string,
    timestamp: string
  ): EnforcementRecord {
    const record: EnforcementRecord = Object.freeze({
      enforcementId: enforcementId,
      decisionId: decision.decisionId,
      taskId: decision.taskId,
      employeeId: decision.employeeId,
      status: status,
      gateResult: gateResult,
      blockedReason: blockedReason,
      timestamp: timestamp,
    });

    this.enforcements.set(enforcementId, record);

    // Audit Log MUST be recorded even on BLOCK events
    this.auditLogs.push(
      Object.freeze({
        auditId: `AUD-ENF-${Date.now()}`,
        enforcementId: enforcementId,
        decisionId: decision.decisionId,
        taskId: decision.taskId,
        employeeId: decision.employeeId,
        decisionStatus: decision.status,
        enforcementResult: gateResult,
        blockedReason: blockedReason,
        timestamp: timestamp,
      })
    );

    return record;
  }

  public getEnforcement(enforcementId: string): EnforcementRecord {
    const record = this.enforcements.get(enforcementId);
    if (!record) {
      throw new Error(`[Enforcement Engine Block] EnforcementId '${enforcementId}' not found.`);
    }
    return record;
  }

  public getAuditLogs(enforcementId?: string): EnforcementAuditRecord[] {
    if (enforcementId) {
      return this.auditLogs.filter((log) => log.enforcementId === enforcementId);
    }
    return [...this.auditLogs];
  }
}
