/**
 * AIOS Employee Governance Decision Foundation
 * Abstraction Interfaces for Risk Evaluator, Approval Resolver, Decision Rule Engine, and Decision Engine
 */

import {
  ApprovalStatus,
  DecisionAuditRecord,
  DecisionContext,
  DecisionRecord,
  RiskLevel,
} from '../models/EmployeeDecisionModels';

export interface IRiskEvaluator {
  evaluateRisk(context: DecisionContext): RiskLevel;
}

export interface IApprovalResolver {
  resolveApprovalStatus(context: DecisionContext, riskLevel: RiskLevel): ApprovalStatus;
  updateApprovalStatus(
    decisionId: string,
    currentStatus: ApprovalStatus,
    newStatus: 'APPROVED' | 'REJECTED',
    authorizedByHuman: boolean
  ): ApprovalStatus;
}

export interface IDecisionRuleEngine {
  evaluateDecision(context: DecisionContext, riskLevel: RiskLevel, approvalStatus: ApprovalStatus): DecisionRecord;
}

export interface IEmployeeGovernanceDecisionEngine {
  makeDecision(requestId: string, context: DecisionContext): DecisionRecord;
  getDecision(decisionId: string): DecisionRecord;
  resolveHumanApproval(decisionId: string, authorizedByHuman: boolean): DecisionRecord;
  getAuditLogs(decisionId?: string): DecisionAuditRecord[];
}
