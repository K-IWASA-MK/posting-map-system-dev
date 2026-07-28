/**
 * EmployeeProvisioningService.ts
 * 
 * Unified AI Employee Provisioning & Registration Service
 */

import { AIEmployeeRegistry } from '../manager/registry/AIEmployeeRegistry';
import { AIEmployeeState } from '../manager/types/AIEmployeeState';
import { CapabilityMappingRegistry, ExecutionPermissionScope } from '../../execution';
import { VerificationCapabilityFactory, VerificationCapabilityStatus, VerificationCapabilityType } from '../../verification';
import { EmployeeCapability } from '../capability/types/EmployeeCapability';
import { EmployeePermission } from '../permission/types/EmployeePermission';
import { DepartmentId } from '../organization/types/DepartmentId';
import { EmployeeRole } from '../role/types/EmployeeRole';
import { EmployeeFactory } from './EmployeeFactory';
import { EmployeeProfile } from './types/EmployeeProfile';
import { EmployeeStatus } from './types/EmployeeStatus';

import { ProfessionAssignment } from '../profession/assignment/types/ProfessionAssignment';

export class EmployeeProvisioningService {
  private static profiles: Map<string, EmployeeProfile> = new Map();
  private static statuses: Map<string, EmployeeStatus> = new Map();

  public static provisionEmployee(
    registry: AIEmployeeRegistry,
    employeeId: string,
    employeeName: string,
    role: EmployeeRole | string,
    departmentId: DepartmentId | string,
    capabilities: EmployeeCapability[] = [],
    permissions?: EmployeePermission[],
    professionAssignment?: ProfessionAssignment
  ): { profile: EmployeeProfile; status: EmployeeStatus } {
    const profile = EmployeeFactory.createProfile(
      employeeId,
      employeeName,
      role,
      departmentId,
      capabilities,
      permissions
    );
    if (professionAssignment) {
      profile.professionAssignment = professionAssignment;
    }
    const status = EmployeeFactory.createInitialStatus(employeeId);

    this.profiles.set(employeeId, profile);
    this.statuses.set(employeeId, status);

    // 1. Register to AIEmployeeRegistry
    registry.registerEmployee(
      profile.identity,
      [],
      {
        departmentId: String(departmentId),
        teamId: `team-${departmentId}`,
        supervisorId: role === EmployeeRole.SUPERVISOR ? undefined : 'emp-supervisor-01',
        priorityGroup: role === EmployeeRole.SUPERVISOR ? 'CORE' : 'SECONDARY'
      }
    );
    registry.updateState(employeeId, AIEmployeeState.IDLE);

    // 2. Register Execution Capability Mapping for Task Orchestration
    const verificationCaps = [
      VerificationCapabilityFactory.createCapability({ type: VerificationCapabilityType.GIT_ACCESS, status: VerificationCapabilityStatus.AVAILABLE }),
      VerificationCapabilityFactory.createCapability({ type: VerificationCapabilityType.BROWSER_AUTOMATION, status: VerificationCapabilityStatus.AVAILABLE }),
      VerificationCapabilityFactory.createCapability({ type: VerificationCapabilityType.API_ACCESS, status: VerificationCapabilityStatus.AVAILABLE })
    ];

    CapabilityMappingRegistry.registerMapping(
      employeeId,
      verificationCaps,
      [
        ExecutionPermissionScope.READ_FILE,
        ExecutionPermissionScope.WRITE_FILE,
        ExecutionPermissionScope.GIT_COMMIT,
        ExecutionPermissionScope.BROWSER_ACTION
      ]
    );

    return { profile, status };
  }

  public static getProfile(employeeId: string): EmployeeProfile | undefined {
    return this.profiles.get(employeeId);
  }

  public static getStatus(employeeId: string): EmployeeStatus | undefined {
    return this.statuses.get(employeeId);
  }

  public static getAllProfiles(): EmployeeProfile[] {
    return Array.from(this.profiles.values());
  }

  public static updateStatus(employeeId: string, update: Partial<EmployeeStatus>): EmployeeStatus | undefined {
    const current = this.statuses.get(employeeId);
    if (!current) return undefined;

    const updated = { ...current, ...update, lastHeartbeat: new Date().toISOString() };
    this.statuses.set(employeeId, updated);
    return updated;
  }

  public static clear(): void {
    this.profiles.clear();
    this.statuses.clear();
  }
}
