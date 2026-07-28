/**
 * AIEmployeeCapabilityAdapter.ts
 * 
 * AIOS AI Employee Capability Adapter
 * 
 * 既存の AIEmployeeRecord を AIOS Execution Runtime / Assignment Runtime が要求する
 * 形式 (AIEmployeeRuntimeProfile: VerificationCapability[] & ExecutionPermissionScope[]) へ動的変換・適合させる。
 */

import { AIEmployeeRecord } from '../../employee/manager/registry/AIEmployeeRegistry';
import { ExecutionPermissionScope } from '../../execution/ExecutionPermissionGate';
import { VerificationCapability } from '../../verification';
import { CapabilityMappingRegistry } from './CapabilityMappingRegistry';

export interface AIEmployeeRuntimeProfile {
  readonly employeeId: string;
  readonly employeeName: string;
  readonly employeeType: string;
  readonly capabilities: readonly VerificationCapability[];
  readonly permissions: readonly ExecutionPermissionScope[];
}

export class AIEmployeeCapabilityAdapter {
  /**
   * AIEmployeeRecord から AIEmployeeRuntimeProfile へ動的変換する
   */
  static adapt(record: AIEmployeeRecord): AIEmployeeRuntimeProfile {
    if (!record || !record.identity || !record.identity.employeeId) {
      throw new Error('[AIEmployeeCapabilityAdapter] Invalid AIEmployeeRecord provided');
    }

    const empId = record.identity.employeeId;
    const empType = record.identity.employeeType;

    // 1. Specific employeeId mapping
    let mapping = CapabilityMappingRegistry.getMapping(empId);

    // 2. Fallback to employeeType mapping or default
    if (!mapping) {
      mapping = CapabilityMappingRegistry.getDefaultMapping(empType);
    }

    return Object.freeze({
      employeeId: empId,
      employeeName: record.identity.employeeName,
      employeeType: empType,
      capabilities: mapping.capabilities,
      permissions: mapping.permissions
    });
  }
}
