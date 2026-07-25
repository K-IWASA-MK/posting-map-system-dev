/**
 * AIOS Employee Governance Enforcement Runtime Foundation
 * Execution Gate Implementation
 */

import { IExecutionGate } from './contract/IEmployeeEnforcement';
import { EnforcementRequest, GateResult } from './models/EmployeeEnforcementModels';

export class ExecutionGate implements IExecutionGate {
  public validateExecution(request: EnforcementRequest): { result: GateResult; reason?: string } {
    const decision = request.decisionRecord;

    if (!decision || !decision.decisionId || !decision.status) {
      return {
        result: 'BLOCK',
        reason: '[Execution Gate Block] Invalid or missing DecisionRecord.',
      };
    }

    if (decision.status === 'DENIED') {
      return {
        result: 'BLOCK',
        reason: `[Execution Gate Block] Execution BLOCKED because Decision status is DENIED (Reason: ${decision.reason}).`,
      };
    }

    if (decision.status !== 'ALLOWED' && decision.status !== 'WAITING_APPROVAL') {
      return {
        result: 'BLOCK',
        reason: `[Execution Gate Block] Execution BLOCKED because Decision status is '${decision.status}'. Only ALLOWED or WAITING_APPROVAL status is permitted.`,
      };
    }

    return { result: 'PASS' };
  }
}
