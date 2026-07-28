/**
 * ResultBuilder.ts
 * 
 * Builder converting WorkflowInstance / WorkflowProgress into ProjectResult with ArtifactReferences
 */

import { WorkflowInstance, WorkflowInstanceStatus } from '../../employee/workflow/types/WorkflowInstance';
import { WorkflowProgress } from '../../employee/workflow/progress/types/WorkflowProgress';
import { ProjectResult } from './types/ProjectResult';
import { ArtifactReference } from '../artifact/types/ArtifactReference';

export class ResultBuilder {
  public static buildResult(
    requestId: string,
    projectId: string,
    instance: WorkflowInstance,
    progress?: WorkflowProgress,
    errorInfo?: string
  ): ProjectResult {
    const isCompleted = instance.status === WorkflowInstanceStatus.COMPLETED;
    const rawArtifacts = progress?.producedArtifacts || [];
    
    const producedArtifacts: ArtifactReference[] = rawArtifacts.map((art, idx) =>
      ArtifactReference.of(`art-${instance.taskId}-${idx + 1}`, art, 'DOCUMENT')
    );

    let status: 'COMPLETED' | 'FAILED' | 'BLOCKED' = 'COMPLETED';
    if (instance.status === WorkflowInstanceStatus.FAILED) status = 'FAILED';
    if (errorInfo) status = 'FAILED';

    const summary = isCompleted
      ? `Workflow '${instance.workflowName}' executed successfully with ${producedArtifacts.length} produced artifacts.`
      : `Workflow '${instance.workflowName}' execution status: ${instance.status}`;

    return {
      requestId,
      projectId,
      taskId: instance.taskId,
      status,
      completed: isCompleted,
      producedArtifacts,
      executionSummary: summary,
      errorInfo,
      completedAt: instance.completedAt || new Date().toISOString()
    };
  }
}
