import { IAIOSClient } from './AIOSClientBoundary';
import { ProjectTaskRequest } from '../../../../../sdk/project/intake/types/ProjectTaskRequest';

export class MockAIOSClient implements IAIOSClient {
  public submit(request: ProjectTaskRequest): { echo: Record<string, any>; status: string; details: string } {
    return {
      echo: request.parameters || { requestId: request.requestId, taskType: request.taskType },
      status: 'PROPOSAL_RECEIVED',
      details: 'Stub acknowledgment successfully generated (MockAIOSClient)'
    };
  }
}

