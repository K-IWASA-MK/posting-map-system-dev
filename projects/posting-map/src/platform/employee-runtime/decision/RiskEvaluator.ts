/**
 * AIOS Employee Governance Decision Foundation
 * Risk Evaluator Implementation
 */

import { IRiskEvaluator } from './contract/IEmployeeDecision';
import { DecisionContext, RiskLevel } from './models/EmployeeDecisionModels';

export class RiskEvaluator implements IRiskEvaluator {
  public evaluateRisk(context: DecisionContext): RiskLevel {
    const task = context.taskContract;

    // 1. Policy DENIED or Task Not Approved -> CRITICAL
    if (context.policyResult.status === 'DENIED' || task.approvalStatus !== 'APPROVED') {
      return 'CRITICAL';
    }

    // 2. Input Lock Mismatch -> HIGH
    if (
      context.actualInputSource !== task.inputSpec.inputSource ||
      context.actualRecordCount !== task.inputSpec.expectedRecordCount
    ) {
      return 'HIGH';
    }

    // 3. Unapproved Tool -> HIGH
    if (!task.allowedTools.includes(context.toolRequested)) {
      return 'HIGH';
    }

    // 4. Action Outside Scope -> HIGH
    if (!task.scope.allowedActions.includes(context.requestedAction)) {
      return 'HIGH';
    }

    return 'LOW';
  }
}
