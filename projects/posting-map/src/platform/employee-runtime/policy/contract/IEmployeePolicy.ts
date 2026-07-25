/**
 * AIOS Employee Governance Policy Foundation
 * Abstraction Interfaces for Policy Registry, Evaluator, Validator, and Provider
 */

import {
  PolicyAuditRecord,
  PolicyEvaluationRequest,
  PolicyEvaluationResult,
  PolicyRecord,
  PolicyType,
} from '../models/EmployeePolicyModels';

export interface IPolicyValidator {
  validatePolicyStructure(policy: PolicyRecord): { valid: boolean; reason?: string };
}

export interface IPolicyEvaluator {
  evaluate(
    policies: PolicyRecord[],
    request: PolicyEvaluationRequest
  ): PolicyEvaluationResult;
}

export interface IPolicyRegistry {
  registerPolicy(policy: PolicyRecord): PolicyRecord;
  createNewVersion(existingPolicyId: string, updatedRules: PolicyRecord['rules']): PolicyRecord;
  getPolicy(policyId: string): PolicyRecord;
  listPolicies(policyType?: PolicyType): PolicyRecord[];
  getAuditLogs(policyId?: string): PolicyAuditRecord[];
}

export interface IPolicyProvider {
  getApplicablePolicies(policyType: PolicyType): PolicyRecord[];
  evaluateRequest(request: PolicyEvaluationRequest): PolicyEvaluationResult;
}
