/**
 * ProjectContextResolver.ts
 * 
 * Engine resolving ProjectContext from ProjectProfile and ProjectTaskRequest
 */

import { ProjectProfile } from '../types/ProjectProfile';
import { ProjectContext } from './types/ProjectContext';

export class ProjectContextResolver {
  public static resolveContext(
    profile: ProjectProfile,
    parameters?: Record<string, any>,
    requestMetadata?: Record<string, any>
  ): ProjectContext {
    return {
      projectId: profile.projectId.getValue(),
      projectName: profile.projectName,
      environment: profile.metadata.environment,
      capability: profile.capability,
      policy: profile.policy,
      workflowParameters: parameters || {},
      securityContext: profile.metadata.customSettings || {},
      requestMetadata: requestMetadata || {},
      createdAt: new Date().toISOString()
    };
  }
}
