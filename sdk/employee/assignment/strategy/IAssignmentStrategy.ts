import { AITaskManifest } from '../types/AITaskManifest';

export interface IAssignmentStrategy {
  selectEmployee(task: AITaskManifest, availableEmployeeIds: string[]): string | null;
}

export class LeastLoadedAssignmentStrategy implements IAssignmentStrategy {
  public selectEmployee(task: AITaskManifest, availableEmployeeIds: string[]): string | null {
    if (availableEmployeeIds.length === 0) return null;
    return availableEmployeeIds[0]; // Simple deterministic selection
  }
}

export class BestCapabilityAssignmentStrategy implements IAssignmentStrategy {
  public selectEmployee(task: AITaskManifest, availableEmployeeIds: string[]): string | null {
    if (availableEmployeeIds.length === 0) return null;
    return availableEmployeeIds[0];
  }
}
