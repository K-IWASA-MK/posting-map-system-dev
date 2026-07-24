import { AITaskManifest } from '../types/AITaskManifest';
import { AITaskState } from '../types/AITaskState';
import { AITaskAssignmentPolicy } from '../policy/AITaskAssignmentPolicy';
import { MaxHandoffExceededException } from '../exceptions/AITaskAssignmentExceptions';

export class BatonRelayManager {
  public handoffTask(task: AITaskManifest, fromEmployeeId: string, toEmployeeId: string, handoffPayload: any): boolean {
    if (task.handoffCount >= AITaskAssignmentPolicy.MAX_HANDOFF_COUNT) {
      throw new MaxHandoffExceededException(`Task '${task.identity.taskId}' reached max handoff count of ${AITaskAssignmentPolicy.MAX_HANDOFF_COUNT}.`);
    }

    task.state = AITaskState.HANDOFF_PENDING;
    task.currentEmployeeId = toEmployeeId;
    task.handoffCount++;
    task.payload = { ...task.payload, handoffPayload };
    task.state = AITaskState.ASSIGNED;
    return true;
  }
}
