/**
 * AIOS Employee Governance Policy Foundation
 * Central Policy Registry & Provider Implementation
 */

import { PolicyEvaluationEngine } from './PolicyEvaluationEngine';
import { PolicyValidator } from './PolicyValidator';
import { IPolicyProvider, IPolicyRegistry } from './contract/IEmployeePolicy';
import {
  PolicyAuditRecord,
  PolicyEvaluationRequest,
  PolicyEvaluationResult,
  PolicyRecord,
  PolicyType,
} from './models/EmployeePolicyModels';

export class PolicyRegistryEngine implements IPolicyRegistry, IPolicyProvider {
  private policies: Map<string, PolicyRecord> = new Map();
  private auditLogs: PolicyAuditRecord[] = [];
  private validator = new PolicyValidator();
  private evaluator = new PolicyEvaluationEngine();

  public registerPolicy(policy: PolicyRecord): PolicyRecord {
    // 1. Validate Structure
    const valRes = this.validator.validatePolicyStructure(policy);
    if (!valRes.valid) {
      throw new Error(valRes.reason);
    }

    // 2. Reject Duplicate PolicyId
    if (this.policies.has(policy.policyId)) {
      throw new Error(
        `[Policy Registry Block] PolicyId '${policy.policyId}' already registered. Direct modification/overwrite forbidden.`
      );
    }

    // 3. Freeze Policy Record (Immutability)
    const frozenRecord: PolicyRecord = Object.freeze({
      ...policy,
      rules: Object.freeze(policy.rules.map((r) => Object.freeze({ ...r }))),
      version: policy.version || 1,
      status: policy.status || 'ACTIVE',
    });

    this.policies.set(policy.policyId, frozenRecord);
    return frozenRecord;
  }

  public createNewVersion(
    existingPolicyId: string,
    updatedRules: PolicyRecord['rules']
  ): PolicyRecord {
    const existing = this.getPolicy(existingPolicyId);

    const newVersion = existing.version + 1;
    const newPolicyId = `${existing.policyName.toLowerCase()}_v${newVersion}`;

    if (this.policies.has(newPolicyId)) {
      throw new Error(`[Policy Registry Block] PolicyId '${newPolicyId}' already exists.`);
    }

    const newRecord: PolicyRecord = Object.freeze({
      ...existing,
      policyId: newPolicyId,
      version: newVersion,
      rules: Object.freeze(updatedRules.map((r) => Object.freeze({ ...r }))),
      createdAt: new Date().toISOString(),
    });

    this.policies.set(newPolicyId, newRecord);
    return newRecord;
  }

  public getPolicy(policyId: string): PolicyRecord {
    const policy = this.policies.get(policyId);
    if (!policy) {
      throw new Error(`[Policy Registry Block] PolicyId '${policyId}' not found.`);
    }
    return policy;
  }

  public listPolicies(policyType?: PolicyType): PolicyRecord[] {
    let list = Array.from(this.policies.values());
    if (policyType) {
      list = list.filter((p) => p.policyType === policyType && p.status === 'ACTIVE');
    }
    return list;
  }

  public getApplicablePolicies(policyType: PolicyType): PolicyRecord[] {
    return this.listPolicies(policyType);
  }

  public evaluateRequest(request: PolicyEvaluationRequest): PolicyEvaluationResult {
    const applicablePolicies = this.getApplicablePolicies(request.policyType);
    const result = this.evaluator.evaluate(applicablePolicies, request);

    // Audit Logging
    this.auditLogs.push(
      Object.freeze({
        auditId: `AUD-POL-${Date.now()}`,
        policyId: result.appliedPolicyId || 'GLOBAL_EVALUATION',
        version: 1,
        requestId: request.requestId,
        targetEmployeeId: request.targetEmployeeId,
        evaluationResult: result.status,
        reason: result.reason,
        timestamp: result.evaluatedAt,
      })
    );

    return result;
  }

  public getAuditLogs(policyId?: string): PolicyAuditRecord[] {
    if (policyId) {
      return this.auditLogs.filter((log) => log.policyId === policyId);
    }
    return [...this.auditLogs];
  }
}
