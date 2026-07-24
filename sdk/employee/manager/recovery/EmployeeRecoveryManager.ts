import { AIEmployeeRegistry } from '../registry/AIEmployeeRegistry';
import { AIEmployeeState } from '../types/AIEmployeeState';
import { EmployeeHealth } from '../types/EmployeeHealth';

export class EmployeeRecoveryManager {
  public async performSelfHealingSequence(employeeId: string, registry: AIEmployeeRegistry): Promise<boolean> {
    console.log(`[Self-Healing] Initiating recovery for AI Employee '${employeeId}'...`);
    const emp = registry.getEmployee(employeeId);

    // 1. Reset state to IDLE
    registry.updateState(employeeId, AIEmployeeState.IDLE);
    // 2. Reset health to NORMAL
    registry.updateHealth(employeeId, EmployeeHealth.NORMAL);

    console.log(`[Self-Healing] AI Employee '${employeeId}' successfully restored to IDLE and NORMAL health.`);
    return true;
  }
}
