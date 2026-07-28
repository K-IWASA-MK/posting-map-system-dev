/**
 * AiSecretaryAdapter.ts
 * 
 * Project Adapter for AI Executive Secretary Assistant Client
 */

import { IProjectAdapter } from './interfaces/IProjectAdapter';
import { ProjectProfile } from '../types/ProjectProfile';
import { ProjectId } from '../types/ProjectId';
import { ProjectType } from '../types/ProjectType';
import { WorkflowCategory } from '../../employee/workflow/types/WorkflowCategory';
import { ProjectTaskRequest } from '../intake/types/ProjectTaskRequest';
import { ProjectResult } from '../result/types/ProjectResult';

export class AiSecretaryAdapter implements IProjectAdapter {
  private static profile: ProjectProfile = {
    projectId: ProjectId.of('AI_SECRETARY'),
    projectName: 'AI Executive Secretary Assistant',
    projectType: ProjectType.AI_ASSISTANT,
    description: 'Executive Task, Schedule & Briefing Assistant',
    capability: {
      supportsWorkflowCategories: [WorkflowCategory.RESEARCH, WorkflowCategory.ENGINEERING, WorkflowCategory.GOVERNANCE],
      supportedTaskTypes: ['EXECUTIVE_BRIEFING', 'SCHEDULE_AUDIT', 'RESEARCH_SUMMARY'],
      supportedArtifactTypes: ['DOCUMENT', 'SUMMARY_NOTES'],
      maxConcurrentTasks: 2
    },
    policy: {
      maxParallelWorkflow: 1,
      requiresHumanApproval: false,
      allowRetry: true,
      priority: 'NORMAL',
      timeoutMs: 20000
    },
    metadata: {
      version: '1.0.0',
      environment: 'production',
      customSettings: { assistantRole: 'EXECUTIVE_SECRETARY' }
    },
    createdAt: new Date().toISOString()
  };

  private lastReceivedResult?: ProjectResult;

  public getProfile(): ProjectProfile {
    return AiSecretaryAdapter.profile;
  }

  public createTaskRequest(
    taskType: string,
    payload: Record<string, any>,
    parameters?: Record<string, any>
  ): ProjectTaskRequest {
    return {
      requestId: `req-secretary-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      projectId: AiSecretaryAdapter.profile.projectId.getValue(),
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
