import { ProjectTaskRequest } from '../../../../../sdk/project/intake/types/ProjectTaskRequest';
import { ProjectTaskResponse } from '../../../../../sdk/project/intake/types/ProjectTaskResponse';
import { ProjectResult } from '../../../../../sdk/project/result/types/ProjectResult';

export interface IAIOSClient {
  submit(request: ProjectTaskRequest): { response: ProjectTaskResponse; result?: ProjectResult } | { echo: Record<string, any>; status: string; details: string };
}

