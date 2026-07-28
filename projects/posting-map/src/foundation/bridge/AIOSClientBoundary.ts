import { TaskIntakeRequest } from '../../../../../sdk/execution/intake/TaskIntakeRequestModel';
import { ExecutionTask } from '../../../../../sdk/execution/ExecutionTaskModel';

export interface IAIOSClient {
  submit(request: TaskIntakeRequest): ExecutionTask | { echo: Record<string, any>; status: string; details: string };
}
