import { TaskIdentity } from './TaskIdentity';
import { AITaskState } from './AITaskState';
import { TaskPriority } from './TaskPriority';

export interface AITaskManifest {
  identity: TaskIdentity;
  priority: TaskPriority;
  ownerEmployeeId: string;
  currentEmployeeId?: string;
  requiredCapability: string;
  dependsOnTaskIds: string[];
  state: AITaskState;
  payload: any;
  handoffCount: number;
  reassignmentCount: number;
}
