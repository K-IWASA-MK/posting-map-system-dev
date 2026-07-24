import { AIEmployeeRegistry, AIEmployeeRecord } from './registry/AIEmployeeRegistry';
import { EmployeeRecoveryManager } from './recovery/EmployeeRecoveryManager';
import { AIEmployeeIdentity } from './types/AIEmployeeIdentity';
import { AIEmployeeState } from './types/AIEmployeeState';
import { AssignmentStatus } from './types/AssignmentStatus';
import { EmployeeHealth } from './types/EmployeeHealth';
import { OrgStructure } from './types/OrgStructure';
import { AIEmployeePolicy } from './policy/AIEmployeePolicy';
import { ICapabilityProvider } from './capabilities/ICapabilityProvider';

export class AIEmployeeManager {
  private static instance: AIEmployeeManager | null = null;
  private registry: AIEmployeeRegistry;
  private recoveryManager: EmployeeRecoveryManager;

  private constructor() {
    this.registry = new AIEmployeeRegistry();
    this.recoveryManager = new EmployeeRecoveryManager();
  }

  public static getInstance(): AIEmployeeManager {
    if (!AIEmployeeManager.instance) {
      AIEmployeeManager.instance = new AIEmployeeManager();
    }
    return AIEmployeeManager.instance;
  }

  public static resetInstance(): void {
    AIEmployeeManager.instance = null;
  }

  public registerEmployee(
    identity: AIEmployeeIdentity,
    capabilities: ICapabilityProvider[] = [],
    orgStructure?: OrgStructure,
    policy?: AIEmployeePolicy
  ): AIEmployeeRecord {
    return this.registry.registerEmployee(identity, capabilities, orgStructure, policy);
  }

  public getEmployee(employeeId: string): AIEmployeeRecord {
    return this.registry.getEmployee(employeeId);
  }

  public getAllEmployees(): AIEmployeeRecord[] {
    return this.registry.getAllEmployees();
  }

  public updateState(employeeId: string, state: AIEmployeeState): void {
    this.registry.updateState(employeeId, state);
  }

  public updateAssignment(employeeId: string, status: AssignmentStatus): void {
    this.registry.updateAssignment(employeeId, status);
  }

  public updateHealth(employeeId: string, health: EmployeeHealth): void {
    this.registry.updateHealth(employeeId, health);
  }

  public async recoverEmployee(employeeId: string): Promise<boolean> {
    return await this.recoveryManager.performSelfHealingSequence(employeeId, this.registry);
  }
}
