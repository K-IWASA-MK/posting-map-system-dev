/**
 * AIOS Employee Governance Policy Foundation
 * Pure Evaluation Engine Implementation (Zero Side Effects)
 */

import { IPolicyEvaluator } from './contract/IEmployeePolicy';
import {
  PolicyEvaluationRequest,
  PolicyEvaluationResult,
  PolicyRecord,
} from './models/EmployeePolicyModels';

export class PolicyEvaluationEngine implements IPolicyEvaluator {
  public evaluate(
    policies: PolicyRecord[],
    request: PolicyEvaluationRequest
  ): PolicyEvaluationResult {
    const timestamp = new Date().toISOString();

    if (!policies || policies.length === 0) {
      return Object.freeze({
        requestId: request.requestId,
        status: 'ALLOWED',
        reason: '[Policy Engine] No active policies found for request type. Default ALLOWED.',
        evaluatedAt: timestamp,
      });
    }

    // Sort by Priority: SYSTEM > EMPLOYEE > TASK
    const priorityOrder: Record<string, number> = {
      SYSTEM: 1,
      EMPLOYEE: 2,
      TASK: 3,
    };

    const sortedPolicies = [...policies].sort(
      (a, b) => (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99)
    );

    // Evaluate sequentially by priority. Highest priority DENIED overrides all.
    for (const policy of sortedPolicies) {
      for (const rule of policy.rules) {
        // Check rule condition against request
        if (rule.effect === 'DENY') {
          // Action check
          if (request.action && rule.condition === 'forbiddenAction' && rule.value === request.action) {
            return Object.freeze({
              requestId: request.requestId,
              status: 'DENIED',
              reason: `[Policy Block] Action '${request.action}' is forbidden by Priority '${policy.priority}' Policy '${policy.policyId}'.`,
              violationCode: 'ACTION_FORBIDDEN',
              appliedPolicyId: policy.policyId,
              evaluatedAt: timestamp,
            });
          }

          // Tool check
          if (request.toolName && rule.condition === 'unapprovedTool' && rule.value === request.toolName) {
            return Object.freeze({
              requestId: request.requestId,
              status: 'DENIED',
              reason: `[Policy Block] Tool '${request.toolName}' is unapproved by Priority '${policy.priority}' Policy '${policy.policyId}'.`,
              violationCode: 'TOOL_UNAPPROVED',
              appliedPolicyId: policy.policyId,
              evaluatedAt: timestamp,
            });
          }
        }
      }
    }

    return Object.freeze({
      requestId: request.requestId,
      status: 'ALLOWED',
      reason: '[Policy Engine] All applicable priority policies evaluated and ALLOWED.',
      evaluatedAt: timestamp,
    });
  }
}
