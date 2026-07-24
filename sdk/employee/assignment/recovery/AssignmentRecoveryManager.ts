import { AITaskManifest } from '../types/AITaskManifest';
import { AITaskState } from '../types/AITaskState';

export class AssignmentRecoveryManager {
  public recoverTask(task: AITaskManifest, fallbackEmployeeId: string): boolean {
    console.log(`[Recovery] Re-assigning stalled task '${task.identity.taskId}' to '${fallbackEmployeeId}'...`);
    task.state = AITaskState.REASSIGNING;
    task.currentEmployeeId = fallbackEmployeeId;
    task.reassignmentCount++;
    task.state = AITaskState.ASSIGNED;
    console.log(`[Recovery] Task '${task.identity.taskId}' successfully recovered.`);
    return true;
  }
}
