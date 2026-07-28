import { IAIOSClient } from './AIOSClientBoundary';
import { ProjectTaskRequest } from '../../../../../sdk/project/intake/types/ProjectTaskRequest';
import { ProjectTaskResponse } from '../../../../../sdk/project/intake/types/ProjectTaskResponse';
import { ProjectResult } from '../../../../../sdk/project/result/types/ProjectResult';
import { ProjectBridgeRuntime } from '../../../../../sdk/project/bridge/ProjectBridgeRuntime';

export class LiveAIOSClient implements IAIOSClient {
  private bridgeRuntime: ProjectBridgeRuntime = new ProjectBridgeRuntime();

  public submit(request: ProjectTaskRequest): { response: ProjectTaskResponse; result?: ProjectResult } {
    return this.bridgeRuntime.submitTask(request);
  }
}

