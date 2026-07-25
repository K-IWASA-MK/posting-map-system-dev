/**
 * AIOS Employee Governance Enforcement Runtime Foundation
 * Approval Gate Implementation (Human Boundary Protection)
 */

import { IApprovalGate } from './contract/IEmployeeEnforcement';
import { EnforcementRequest, GateResult } from './models/EmployeeEnforcementModels';

export class ApprovalGate implements IApprovalGate {
  public validateApproval(request: EnforcementRequest): { result: GateResult; reason?: string } {
    const decision = request.decisionRecord;

    if (decision.status === 'WAITING_APPROVAL' || decision.approvalStatus === 'REQUIRED') {
      if (!request.authorizedByHuman) {
        return {
          result: 'BLOCK',
          reason: '[Approval Gate Block] Decision requires explicit human authorization. Automated approval bypass is strictly forbidden.',
        };
      }
    }

    return { result: 'PASS' };
  }
}
