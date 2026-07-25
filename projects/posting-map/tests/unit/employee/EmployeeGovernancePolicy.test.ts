/**
 * AIOS Employee Governance Policy Foundation
 * Unit Test Suite
 */

import { describe, expect, it } from 'vitest';
import { PolicyRegistryEngine } from '../../../src/platform/employee-runtime/policy/PolicyRegistryEngine';
import {
  PolicyEvaluationRequest,
  PolicyRecord,
} from '../../../src/platform/employee-runtime/policy/models/EmployeePolicyModels';

describe('AIOS Employee Governance Policy Foundation', () => {
  const systemPolicy: PolicyRecord = {
    policyId: 'sys_command_policy_v1',
    policyName: 'System Core Command Policy',
    policyType: 'COMMAND_SCOPE_POLICY',
    priority: 'SYSTEM',
    version: 1,
    rules: [
      {
        ruleId: 'RULE-SYS-01',
        condition: 'forbiddenAction',
        effect: 'DENY',
        value: 'modify_gas_code',
      },
    ],
    status: 'ACTIVE',
    createdAt: '2026-07-26T04:32:00Z',
  };

  const taskPolicy: PolicyRecord = {
    policyId: 'task_command_policy_v1',
    policyName: 'Task Specific Command Policy',
    policyType: 'COMMAND_SCOPE_POLICY',
    priority: 'TASK',
    version: 1,
    rules: [
      {
        ruleId: 'RULE-TASK-01',
        condition: 'forbiddenAction',
        effect: 'DENY',
        value: 'unapproved_script_execution',
      },
    ],
    status: 'ACTIVE',
    createdAt: '2026-07-26T04:32:00Z',
  };

  // Scenario 1: Policy v1 Registration & Retrieval
  it('should register Policy v1 successfully and retrieve it by ID', () => {
    const registry = new PolicyRegistryEngine();
    const registered = registry.registerPolicy(systemPolicy);

    expect(registered.policyId).toBe('sys_command_policy_v1');
    expect(registry.getPolicy('sys_command_policy_v1').priority).toBe('SYSTEM');
  });

  // Scenario 2: Rejection of Duplicate PolicyId Registration
  it('should reject duplicate PolicyId registration attempt', () => {
    const registry = new PolicyRegistryEngine();
    registry.registerPolicy(systemPolicy);

    expect(() => registry.registerPolicy(systemPolicy)).toThrow(
      /PolicyId 'sys_command_policy_v1' already registered/
    );
  });

  // Scenario 3: Version 2 Generation and Version 1 Retention Confirmation
  it('should generate Version 2 for updated policy rules while maintaining Version 1', () => {
    const registry = new PolicyRegistryEngine();
    const v1 = registry.registerPolicy(systemPolicy);

    const v2 = registry.createNewVersion(v1.policyId, [
      ...systemPolicy.rules,
      {
        ruleId: 'RULE-SYS-02',
        condition: 'forbiddenAction',
        effect: 'DENY',
        value: 'delete_audit_logs',
      },
    ]);

    expect(v1.version).toBe(1);
    expect(v2.version).toBe(2);

    expect(registry.getPolicy('sys_command_policy_v1').version).toBe(1);
    expect(registry.getPolicy(v2.policyId).version).toBe(2);
  });

  // Scenario 4: Direct Policy Mutation Rejection (Immutability)
  it('should reject direct property mutation of registered PolicyRecord', () => {
    const registry = new PolicyRegistryEngine();
    const registered = registry.registerPolicy(systemPolicy);

    // Mutation attempt must throw
    expect(() => {
      (registered as any).priority = 'TASK';
    }).toThrow();
  });

  // Scenario 5 & 6: SYSTEM Priority Evaluation & TASK Override Rejection
  it('should enforce SYSTEM priority over TASK policy (SYSTEM DENIED overrides TASK ALLOWED)', () => {
    const registry = new PolicyRegistryEngine();
    registry.registerPolicy(systemPolicy); // Priority: SYSTEM, DENIES modify_gas_code
    registry.registerPolicy(taskPolicy);   // Priority: TASK

    // Request to execute 'modify_gas_code'
    const evalRequest: PolicyEvaluationRequest = {
      requestId: 'REQ-EVAL-001',
      policyType: 'COMMAND_SCOPE_POLICY',
      targetEmployeeId: 'EMP-MIE03-01',
      action: 'modify_gas_code',
    };

    const evalResult = registry.evaluateRequest(evalRequest);

    expect(evalResult.status).toBe('DENIED');
    expect(evalResult.violationCode).toBe('ACTION_FORBIDDEN');
    expect(evalResult.appliedPolicyId).toBe('sys_command_policy_v1');
    expect(evalResult.reason).toContain("forbidden by Priority 'SYSTEM' Policy 'sys_command_policy_v1'");
  });

  // Scenario 7: Policy Evaluation Audit Logging
  it('should record audit trail for policy evaluation requests', () => {
    const registry = new PolicyRegistryEngine();
    registry.registerPolicy(systemPolicy);

    const evalRequest: PolicyEvaluationRequest = {
      requestId: 'REQ-AUD-002',
      policyType: 'COMMAND_SCOPE_POLICY',
      targetEmployeeId: 'EMP-MIE03-01',
      action: 'modify_gas_code',
    };

    registry.evaluateRequest(evalRequest);

    const logs = registry.getAuditLogs('sys_command_policy_v1');
    expect(logs.length).toBe(1);
    expect(logs[0].evaluationResult).toBe('DENIED');
    expect(logs[0].targetEmployeeId).toBe('EMP-MIE03-01');
  });
});
