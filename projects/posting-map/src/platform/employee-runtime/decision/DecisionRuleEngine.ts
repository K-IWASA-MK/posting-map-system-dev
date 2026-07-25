/**
 * AIOS Employee Governance Decision Foundation
 * Deterministic Decision Rule Engine Implementation
 */

import { IDecisionRuleEngine } from './contract/IEmployeeDecision';
import {
  ApprovalStatus,
  DecisionContext,
  DecisionRecord,
  RiskLevel,
} from './models/EmployeeDecisionModels';

export class DecisionRuleEngine implements IDecisionRuleEngine {
  public evaluateDecision(
    context: DecisionContext,
    riskLevel: RiskLevel,
    approvalStatus: ApprovalStatus
  ): DecisionRecord {
    const timestamp = new Date().toISOString();
    const decisionId = `DEC-${context.taskContract.taskId}-${Date.now()}`;
    const task = context.taskContract;

    // 1. Policy DENIED -> DENIED (SYSTEM DENIED cannot be overridden)
    if (context.policyResult.status === 'DENIED') {
      return Object.freeze({
        decisionId: decisionId,
        requestId: `REQ-${decisionId}`,
        taskId: task.taskId,
        employeeId: context.employeeId,
        status: 'DENIED',
        riskLevel: 'CRITICAL',
        approvalStatus: 'REJECTED',
        appliedPolicies: Object.freeze([context.policyResult.appliedPolicyId || 'UNKNOWN_POLICY']),
        reason: context.policyResult.reason,
        evaluatedAt: timestamp,
      });
    }

    // 2. Input Lock Mismatch -> DENIED
    if (
      context.actualSource !== task.inputSpec.inputSource ||
      context.actualRecordCount !== task.inputSpec.expectedRecordCount
    ) {
      return Object.freeze({
        decisionId: decisionId,
        requestId: `REQ-${decisionId}`,
        taskId: task.taskId,
        employeeId: context.employeeId,
        status: 'DENIED',
        riskLevel: 'HIGH',
        approvalStatus: 'REJECTED',
        appliedPolicies: Object.freeze(['INPUT_LOCK_POLICY']),
        reason: `[Decision Block] Record count mismatch. Expected ${task.inputSpec.expectedRecordCount} records, got ${context.actualRecordCount} records. Execution DENIED.`,
        evaluatedAt: timestamp,
      });
    }

    // 3. Unapproved Tool -> DENIED
    if (!task.allowedTools.includes(context.toolRequested)) {
      return Object.freeze({
        decisionId: decisionId,
        requestId: `REQ-${decisionId}`,
        taskId: task.taskId,
        employeeId: context.employeeId,
        status: 'DENIED',
        riskLevel: 'HIGH',
        approvalStatus: 'REJECTED',
        appliedPolicies: Object.freeze(['TOOL_PERMISSION_POLICY']),
        reason: `[Decision Block] Tool '${context.toolRequested}' is not in allowedTools whitelist. Execution DENIED.`,
        evaluatedAt: timestamp,
      });
    }

    // 4. Scope Outside Action or HIGH Risk -> WAITING_APPROVAL
    if (approvalStatus === 'REQUIRED' || riskLevel === 'HIGH') {
      return Object.freeze({
        decisionId: decisionId,
        requestId: `REQ-${decisionId}`,
        taskId: task.taskId,
        employeeId: context.employeeId,
        status: 'WAITING_APPROVAL',
        riskLevel: riskLevel,
        approvalStatus: 'REQUIRED',
        appliedPolicies: Object.freeze(['COMMAND_SCOPE_POLICY']),
        reason: `[Decision Block] Requested action '${context.requestedAction}' requires explicit human approval. Status set to WAITING_APPROVAL.`,
        evaluatedAt: timestamp,
      });
    }

    // 5. All PASS -> ALLOWED
    return Object.freeze({
      decisionId: decisionId,
      requestId: `REQ-${decisionId}`,
      taskId: task.taskId,
      employeeId: context.employeeId,
      status: 'ALLOWED',
      riskLevel: 'LOW',
      approvalStatus: 'NOT_REQUIRED',
      appliedPolicies: Object.freeze(['GOVERNANCE_SYSTEM_POLICY']),
      reason: '[Decision Engine] All governance checks, input locks, tool permissions, and policy rules evaluated cleanly. Execution ALLOWED.',
      evaluatedAt: timestamp,
    });
  }
}
