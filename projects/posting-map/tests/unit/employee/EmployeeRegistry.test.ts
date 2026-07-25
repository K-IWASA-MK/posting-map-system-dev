/**
 * AIOS Employee Registry Foundation
 * Unit Test Suite
 */

import { describe, expect, it } from 'vitest';
import { EmployeeRegistryEngine } from '../../../src/platform/employee-runtime/registry/EmployeeRegistryEngine';
import { EmployeeRecord } from '../../../src/platform/employee-runtime/registry/models/EmployeeRegistryModels';

describe('AIOS Employee Registry Foundation', () => {
  // Acceptance Criterion 1 & 2: Unique Registration & Duplicate EmployeeId Rejection
  it('should register an employee uniquely and reject duplicate EmployeeId', () => {
    const registry = new EmployeeRegistryEngine();
    const emp1: EmployeeRecord = {
      employeeId: 'EMP-DISTRICT-01',
      employeeName: 'District Initializer Agent',
      employeeType: 'OPERATIONAL',
      roleId: 'ROLE_DISTRICT_INITIALIZER',
      authorityLevel: 'EXECUTE',
      capabilities: ['address_processing', 'sheet_generation'],
      status: 'REGISTERED',
      registeredAt: '2026-07-26T03:57:00Z',
    };

    registry.register(emp1);
    const found = registry.get('EMP-DISTRICT-01');
    expect(found.employeeName).toBe('District Initializer Agent');

    // Duplicate registration attempt
    expect(() => registry.register(emp1)).toThrow(/EmployeeId 'EMP-DISTRICT-01' already exists/);
  });

  // Acceptance Criterion 3: AuthorityLevel Reference
  it('should allow reading authorityLevel referenced from Governance Foundation v1', () => {
    const registry = new EmployeeRegistryEngine();
    registry.register({
      employeeId: 'EMP-VALIDATOR-01',
      employeeName: 'Quality Validator Agent',
      employeeType: 'VALIDATOR',
      roleId: 'ROLE_QA_VALIDATOR',
      authorityLevel: 'READ_ONLY',
      capabilities: ['validation'],
      status: 'ACTIVE',
      registeredAt: '2026-07-26T03:57:00Z',
    });

    const emp = registry.get('EMP-VALIDATOR-01');
    expect(emp.authorityLevel).toBe('READ_ONLY');
  });

  // Acceptance Criterion 4: Capability Query
  it('should return correct capabilities list for employees', () => {
    const registry = new EmployeeRegistryEngine();
    registry.register({
      employeeId: 'EMP-REPORTER-01',
      employeeName: 'Audit Reporter Agent',
      employeeType: 'AUDITOR',
      roleId: 'ROLE_AUDIT_REPORTER',
      authorityLevel: 'READ_ONLY',
      capabilities: ['reporting', 'audit_logging'],
      status: 'ACTIVE',
      registeredAt: '2026-07-26T03:57:00Z',
    });

    const list = registry.list({ capability: 'reporting' });
    expect(list.length).toBe(1);
    expect(list[0].employeeId).toBe('EMP-REPORTER-01');
    expect(list[0].capabilities).toContain('reporting');
  });

  // Acceptance Criterion 5: Lifecycle Status Transition & Audit Trail
  it('should update lifecycle status and record audit logs correctly', () => {
    const registry = new EmployeeRegistryEngine();
    registry.register({
      employeeId: 'EMP-OPS-01',
      employeeName: 'Field Ops Worker Agent',
      employeeType: 'OPERATIONAL',
      roleId: 'ROLE_FIELD_OPS',
      authorityLevel: 'EXECUTE',
      capabilities: ['sheet_generation'],
      status: 'REGISTERED',
      registeredAt: '2026-07-26T03:57:00Z',
    });

    // Update REGISTERED -> ACTIVE
    registry.updateStatus('EMP-OPS-01', 'ACTIVE');
    expect(registry.get('EMP-OPS-01').status).toBe('ACTIVE');

    // Update ACTIVE -> SUSPENDED
    registry.updateStatus('EMP-OPS-01', 'SUSPENDED');
    expect(registry.get('EMP-OPS-01').status).toBe('SUSPENDED');

    // Audit logs check
    const logs = registry.getAuditLogs('EMP-OPS-01');
    expect(logs.length).toBe(3); // 1 REGISTER + 2 UPDATE_STATUS
    expect(logs[0].action).toBe('REGISTER');
    expect(logs[1].before).toBe('REGISTERED');
    expect(logs[1].after).toBe('ACTIVE');
    expect(logs[2].before).toBe('ACTIVE');
    expect(logs[2].after).toBe('SUSPENDED');
  });

  // Additional Lifecycle Constraint: Prohibit restoration from RETIRED status
  it('should prohibit transition from RETIRED status to ACTIVE status', () => {
    const registry = new EmployeeRegistryEngine();
    registry.register({
      employeeId: 'EMP-RETIRED-01',
      employeeName: 'Legacy Worker Agent',
      employeeType: 'OPERATIONAL',
      roleId: 'ROLE_LEGACY',
      authorityLevel: 'READ_ONLY',
      capabilities: ['legacy_import'],
      status: 'ACTIVE',
      registeredAt: '2026-07-26T03:57:00Z',
    });

    // ACTIVE -> RETIRED
    registry.updateStatus('EMP-RETIRED-01', 'RETIRED');
    expect(registry.get('EMP-RETIRED-01').status).toBe('RETIRED');

    // Attempt RETIRED -> ACTIVE (Prohibited)
    expect(() => registry.updateStatus('EMP-RETIRED-01', 'ACTIVE')).toThrow(
      /Cannot transition Employee 'EMP-RETIRED-01' from 'RETIRED' to 'ACTIVE'/
    );
  });
});
