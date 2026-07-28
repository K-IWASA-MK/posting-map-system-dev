/**
 * FieldOperationsAdapter.ts
 * 
 * Project Adapter for Field Operations & Territory Platform Client
 */

import { IProjectAdapter } from './interfaces/IProjectAdapter';
import { ProjectProfile } from '../types/ProjectProfile';
import { ProjectId } from '../types/ProjectId';
import { ProjectType } from '../types/ProjectType';
import { WorkflowCategory } from '../../employee/workflow/types/WorkflowCategory';
import { ProjectTaskRequest } from '../intake/types/ProjectTaskRequest';
import { ProjectResult } from '../result/types/ProjectResult';

export class FieldOperationsAdapter implements IProjectAdapter {
  private static profile: ProjectProfile = {
    projectId: ProjectId.of('FIELD_OPERATIONS'),
    projectName: 'Field Operations Platform',
    projectType: ProjectType.WEB_APPLICATION,
    description: 'Territory Boundary and Operations System',
    capability: {
      supportsWorkflowCategories: [WorkflowCategory.ENGINEERING, WorkflowCategory.RESEARCH, WorkflowCategory.QUALITY_ASSURANCE, WorkflowCategory.DEPLOYMENT],
      supportedTaskTypes: ['EXECUTE_FIELD_VERIFICATION', 'TERRITORY_INITIALIZATION', 'RESEARCH_REQUEST', 'SYSTEM_DEPLOYMENT'],
      supportedArtifactTypes: ['DOCUMENT', 'CSV', 'GEOJSON', 'REPORT'],
      maxConcurrentTasks: 5
    },
    policy: {
      maxParallelWorkflow: 3,
      requiresHumanApproval: false,
      allowRetry: true,
      priority: 'HIGH',
      timeoutMs: 60000
    },
    metadata: {
      version: '2.0.0',
      environment: 'production',
      customSettings: { platform: 'web' }
    },
    createdAt: new Date().toISOString()
  };

  private lastReceivedResult?: ProjectResult;

  public getProfile(): ProjectProfile {
    return FieldOperationsAdapter.profile;
  }

  public createTaskRequest(
    taskType: string,
    payload: Record<string, any>,
    parameters?: Record<string, any>
  ): ProjectTaskRequest {
    return {
      requestId: `req-fieldops-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      projectId: FieldOperationsAdapter.profile.projectId.getValue(),
      taskType,
      payload,
      parameters,
      timestamp: new Date().toISOString()
    };
  }

  public handleCallback(result: ProjectResult): void {
    this.lastReceivedResult = result;
  }

  public getLastReceivedResult(): ProjectResult | undefined {
    return this.lastReceivedResult;
  }
}
