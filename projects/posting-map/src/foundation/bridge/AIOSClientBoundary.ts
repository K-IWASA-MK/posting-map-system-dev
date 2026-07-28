import { TaskIntakeRequest } from '../../../../../sdk/execution/intake/TaskIntakeRequestModel';
import { ExecutionTask } from '../../../../../sdk/execution/ExecutionTaskModel';
import { AIOSBridgeMode } from './AIOSBridgeMode';
import { MockAIOSClient } from './MockAIOSClient';
import { LiveAIOSClient } from './LiveAIOSClient';

export interface IAIOSClient {
  submit(request: TaskIntakeRequest): ExecutionTask | { echo: Record<string, any>; status: string; details: string };
}

export class AIOSClientFactory {
  public static createClient(mode: AIOSBridgeMode): IAIOSClient {
    if (mode === AIOSBridgeMode.LIVE) {
      return new LiveAIOSClient();
    }
    return new MockAIOSClient();
  }
}
