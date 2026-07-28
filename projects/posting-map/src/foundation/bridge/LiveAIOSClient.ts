import { IAIOSClient } from './AIOSClientBoundary';
import { TaskIntakeRequest } from '../../../../../sdk/execution/intake/TaskIntakeRequestModel';
import { ExecutionTask } from '../../../../../sdk/execution/ExecutionTaskModel';
import { TaskIntakeGateway } from '../../../../../sdk/execution/intake/TaskIntakeGateway';

export class LiveAIOSClient implements IAIOSClient {
  public submit(request: TaskIntakeRequest): ExecutionTask {
    return TaskIntakeGateway.submitTask(request);
  }
}
