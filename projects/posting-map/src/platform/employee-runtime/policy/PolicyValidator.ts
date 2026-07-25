/**
 * AIOS Employee Governance Policy Foundation
 * Policy Validator Implementation
 */

import { IPolicyValidator } from './contract/IEmployeePolicy';
import { PolicyRecord } from './models/EmployeePolicyModels';

export class PolicyValidator implements IPolicyValidator {
  public validatePolicyStructure(policy: PolicyRecord): { valid: boolean; reason?: string } {
    if (!policy.policyId || !policy.policyName) {
      return { valid: false, reason: '[Policy Validator Block] Missing policyId or policyName.' };
    }

    if (!policy.policyType || !policy.priority) {
      return { valid: false, reason: '[Policy Validator Block] Missing policyType or priority.' };
    }

    if (!policy.rules || policy.rules.length === 0) {
      return { valid: false, reason: '[Policy Validator Block] Policy must contain at least one rule.' };
    }

    return { valid: true };
  }
}
