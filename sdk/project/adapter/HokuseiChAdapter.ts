/**
 * HokuseiChAdapter.ts
 * 
 * Project Adapter for Hokusei Channel Media Platform Client
 */

import { IProjectAdapter } from './interfaces/IProjectAdapter';
import { ProjectProfile } from '../types/ProjectProfile';
import { ProjectId } from '../types/ProjectId';
import { ProjectType } from '../types/ProjectType';
import { WorkflowCategory } from '../../employee/workflow/types/WorkflowCategory';
import { ProjectTaskRequest } from '../intake/types/ProjectTaskRequest';
import { ProjectResult } from '../result/types/ProjectResult';

export class HokuseiChAdapter implements IProjectAdapter {
  private static profile: ProjectProfile = {
    projectId: ProjectId.of('HOKUSEI_CH'),
    projectName: 'Hokusei Channel Media Platform',
    projectType: ProjectType.MEDIA_PLATFORM,
    description: 'Regional Weather Alert and Video Publishing System',
    capability: {
      supportsWorkflowCategories: [WorkflowCategory.OPERATIONAL, WorkflowCategory.DEPLOYMENT, WorkflowCategory.RESEARCH],
      supportedTaskTypes: ['WEATHER_ALERT_PUBLISH', 'VIDEO_PUBLISH', 'MEDIA_RESEARCH'],
      supportedArtifactTypes: ['VIDEO', 'IMAGE', 'JSON_MANIFEST'],
      maxConcurrentTasks: 3
    },
    policy: {
      maxParallelWorkflow: 2,
      requiresHumanApproval: false,
      allowRetry: true,
      priority: 'HIGH',
      timeoutMs: 30000
    },
    metadata: {
      version: '1.5.0',
      environment: 'production',
      customSettings: { channelId: 'ch-hokusei-01' }
    },
    createdAt: new Date().toISOString()
  };

  private lastReceivedResult?: ProjectResult;

  public getProfile(): ProjectProfile {
    return HokuseiChAdapter.profile;
  }

  public createTaskRequest(
    taskType: string,
    payload: Record<string, any>,
    parameters?: Record<string, any>
  ): ProjectTaskRequest {
    return {
      requestId: `req-hokuseich-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      projectId: HokuseiChAdapter.profile.projectId.getValue(),
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
