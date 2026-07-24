import { AIEmployeeIdentity } from '../types/AIEmployeeIdentity';
import { AIEmployeeState } from '../types/AIEmployeeState';
import { AssignmentStatus } from '../types/AssignmentStatus';
import { EmployeeHealth } from '../types/EmployeeHealth';
import { OrgStructure } from '../types/OrgStructure';
import { AIEmployeePolicy, DefaultAIEmployeePolicy } from '../policy/AIEmployeePolicy';
import { ICapabilityProvider } from '../capabilities/ICapabilityProvider';
import { EmployeeAlreadyExistsException, EmployeeNotFoundException } from '../exceptions/AIEmployeeExceptions';

export interface AIEmployeeRecord {
  identity: AIEmployeeIdentity;
  state: AIEmployeeState;
  assignmentStatus: AssignmentStatus;
  health: EmployeeHealth;
  policy: AIEmployeePolicy;
  capabilities: ICapabilityProvider[];
  orgStructure: OrgStructure;
}

export class AIEmployeeRegistry {
  private employees: Map<string, AIEmployeeRecord> = new Map();

  public registerEmployee(
    identity: AIEmployeeIdentity,
    capabilities: ICapabilityProvider[] = [],
    orgStructure: OrgStructure = { departmentId: 'dept-general', teamId: 'team-ops', priorityGroup: 'CORE' },
    policy: AIEmployeePolicy = new DefaultAIEmployeePolicy()
  ): AIEmployeeRecord {
    if (this.employees.has(identity.employeeId)) {
      throw new EmployeeAlreadyExistsException(`AI Employee with ID '${identity.employeeId}' is already registered.`);
    }

    const record: AIEmployeeRecord = {
      identity,
      state: AIEmployeeState.PROVISIONED,
      assignmentStatus: AssignmentStatus.UNASSIGNED,
      health: EmployeeHealth.NORMAL,
      policy,
      capabilities,
      orgStructure
    };

    this.employees.set(identity.employeeId, record);
    return record;
  }

  public getEmployee(employeeId: string): AIEmployeeRecord {
    const emp = this.employees.get(employeeId);
    if (!emp) {
      throw new EmployeeNotFoundException(`AI Employee '${employeeId}' not found in registry.`);
    }
    return emp;
  }

  public getAllEmployees(): AIEmployeeRecord[] {
    return Array.from(this.employees.values());
  }

  public updateState(employeeId: string, newState: AIEmployeeState): void {
    const emp = this.getEmployee(employeeId);
    emp.state = newState;
  }

  public updateAssignment(employeeId: string, status: AssignmentStatus): void {
    const emp = this.getEmployee(employeeId);
    emp.assignmentStatus = status;
  }

  public updateHealth(employeeId: string, health: EmployeeHealth): void {
    const emp = this.getEmployee(employeeId);
    emp.health = health;
  }
}
