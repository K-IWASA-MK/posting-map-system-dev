import { IAIOSClient } from './AIOSClientBoundary';
import { TaskIntakeRequest } from '../../../../../sdk/execution/intake/TaskIntakeRequestModel';

export class MockAIOSClient implements IAIOSClient {
  public submit(request: TaskIntakeRequest): { echo: Record<string, any>; status: string; details: string } {
    return {
      echo: request.metadata?.payload || { requestId: request.requestId, title: request.title },
      status: 'PROPOSAL_RECEIVED',
      details: 'Stub acknowledgment successfully generated (MockAIOSClient)'
    };
  }
}
