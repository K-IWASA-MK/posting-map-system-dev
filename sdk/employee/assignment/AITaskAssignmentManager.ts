import { TaskAssignmentEngine } from './engine/TaskAssignmentEngine';
import { BatonRelayManager } from './relay/BatonRelayManager';
import { AssignmentRecoveryManager } from './recovery/AssignmentRecoveryManager';
import { AITaskManifest } from './types/AITaskManifest';

export class AITaskAssignmentManager {
  private static instance: AITaskAssignmentManager | null = null;
  private engine: TaskAssignmentEngine;
  private relayManager: BatonRelayManager;
  private recoveryManager: AssignmentRecoveryManager;

  private constructor() {
    this.engine = new TaskAssignmentEngine();
    this.relayManager = new BatonRelayManager();
    this.recoveryManager = new AssignmentRecoveryManager();
  }

  public static getInstance(): AITaskAssignmentManager {
    if (!AITaskAssignmentManager.instance) {
      AITaskAssignmentManager.instance = new AITaskAssignmentManager();
    }
    return AITaskAssignmentManager.instance;
  }

  public static resetInstance(): void {
    AITaskAssignmentManager.instance = null;
  }

  public registerTask(task: AITaskManifest): void {
    this.engine.registerTask(task);
  }

  public getTask(taskId: string): AITaskManifest | undefined {
    return this.engine.getTask(taskId);
  }

  public assignTask(taskId: string, availableEmployeeIds: string[]): string {
    return this.engine.assignTask(taskId, availableEmployeeIds);
  }

  public handoffTask(task: AITaskManifest, fromEmployeeId: string, toEmployeeId: string, payload: any): boolean {
    return this.relayManager.handoffTask(task, fromEmployeeId, toEmployeeId, payload);
  }

  public recoverTask(task: AITaskManifest, fallbackEmployeeId: string): boolean {
    return this.recoveryManager.recoverTask(task, fallbackEmployeeId);
  }
}
