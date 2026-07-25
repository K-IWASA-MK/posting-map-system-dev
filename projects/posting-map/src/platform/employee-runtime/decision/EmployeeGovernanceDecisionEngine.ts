/**
 * AIOS Employee Governance Decision Foundation
 * Integrated Decision Engine Implementation
 */

import { ApprovalResolver } from './ApprovalResolver';
import { DecisionRuleEngine } from './DecisionRuleEngine';
import { RiskEvaluator } from './RiskEvaluator';
import { IEmployeeGovernanceDecisionEngine } from './contract/IEmployeeDecision';
import {
  DecisionAuditRecord,
  DecisionContext,
  DecisionRecord,
} from './models/EmployeeDecisionModels';

export class EmployeeGovernanceDecisionEngine implements IEmployeeGovernanceDecisionEngine {
  private decisions: Map<string, DecisionRecord> = new Map();
  private auditLogs: DecisionAuditRecord[] = [];
  private riskEvaluator = new RiskEvaluator();
  private approvalResolver = new ApprovalResolver();
  private ruleEngine = new DecisionRuleEngine();

  public makeDecision(requestId: string, context: DecisionContext): DecisionRecord {
    const riskLevel = this.riskEvaluator.evaluateRisk(context);
    const initialApproval = this.approvalResolver.resolveApprovalStatus(context, riskLevel);

    const record = this.ruleEngine.evaluateDecision(context, riskLevel, initialApproval);

    if (this.decisions.has(record.decisionId)) {
      throw new Error(`[Decision Engine Block] DecisionId '${record.decisionId}' already exists.`);
    }

    this.decisions.set(record.decisionId, record);

    // Immutable Audit Trail Logging
    this.auditLogs.push(
      Object.freeze({
        auditId: `AUD-DEC-${Date.now()}`,
        decisionId: record.decisionId,
        taskId: record.taskId,
        employeeId: record.employeeId,
        decisionStatus: record.status,
        riskLevel: record.riskLevel,
        approvalStatus: record.approvalStatus,
        reason: record.reason,
        timestamp: new Date().toISOString(),
      })
    );

    return record;
  }

  public getDecision(decisionId: string): DecisionRecord {
    const record = this.decisions.get(decisionId);
    if (!record) {
      throw new Error(`[Decision Engine Block] DecisionId '${decisionId}' not found.`);
    }
    return record;
  }

  public resolveHumanApproval(
    decisionId: string,
    authorizedByHuman: boolean
  ): DecisionRecord {
    const current = this.getDecision(decisionId);

    if (current.status !== 'WAITING_APPROVAL') {
      throw new Error(
        `[Decision Engine Block] Decision '${decisionId}' is in status '${current.status}'. Human approval resolution only applies to WAITING_APPROVAL.`
      );
    }

    const newApprovalStatus = this.approvalResolver.updateApprovalStatus(
      decisionId,
      current.approvalStatus,
      'APPROVED',
      authorizedByHuman
    );

    const updatedRecord: DecisionRecord = Object.freeze({
      ...current,
      status: 'ALLOWED',
      approvalStatus: newApprovalStatus,
      reason: '[Decision Engine] Human authorization received. Status transitioned from WAITING_APPROVAL to ALLOWED.',
      evaluatedAt: new Date().toISOString(),
    });

    this.decisions.set(decisionId, updatedRecord);

    this.auditLogs.push(
      Object.freeze({
        auditId: `AUD-DEC-HUMAN-${Date.now()}`,
        decisionId: decisionId,
        taskId: current.taskId,
        employeeId: current.employeeId,
        decisionStatus: 'ALLOWED',
        riskLevel: current.riskLevel,
        approvalStatus: newApprovalStatus,
        reason: updatedRecord.reason,
        timestamp: new Date().toISOString(),
      })
    );

    return updatedRecord;
  }

  public getAuditLogs(decisionId?: string): DecisionAuditRecord[] {
    if (decisionId) {
      return this.auditLogs.filter((log) => log.decisionId === decisionId);
    }
    return [...this.auditLogs];
  }
}
