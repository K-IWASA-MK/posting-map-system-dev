/**
 * AIOS Employee Governance Decision Foundation
 * Approval Resolver Implementation
 */

import { IApprovalResolver } from './contract/IEmployeeDecision';
import { ApprovalStatus, DecisionContext, RiskLevel } from './models/EmployeeDecisionModels';

export class ApprovalResolver implements IApprovalResolver {
  public resolveApprovalStatus(context: DecisionContext, riskLevel: RiskLevel): ApprovalStatus {
    if (riskLevel === 'CRITICAL') {
      return 'REJECTED';
    }

    if (riskLevel === 'HIGH' || !context.taskContract.scope.allowedActions.includes(context.requestedAction)) {
      return 'REQUIRED';
    }

    return 'NOT_REQUIRED';
  }

  public updateApprovalStatus(
    decisionId: string,
    currentStatus: ApprovalStatus,
    newStatus: 'APPROVED' | 'REJECTED',
    authorizedByHuman: boolean
  ): ApprovalStatus {
    if (newStatus === 'APPROVED' && !authorizedByHuman) {
      throw new Error(
        `[Approval Resolver Block] Automated transition of Decision '${decisionId}' to 'APPROVED' is strictly forbidden. Explicit human authorization required.`
      );
    }

    if (currentStatus === 'REJECTED') {
      throw new Error(
        `[Approval Resolver Block] Cannot transition Decision '${decisionId}' from 'REJECTED' to 'APPROVED'.`
      );
    }

    return newStatus;
  }
}
