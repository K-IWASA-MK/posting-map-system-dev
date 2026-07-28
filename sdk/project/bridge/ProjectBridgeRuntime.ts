/**
 * ProjectBridgeRuntime.ts
 * 
 * Unified Project Bridge Runtime orchestrating Intake, Supervisor Execution, Result Building & Callback Dispatch
 */

import { ProjectBridge } from './interfaces/ProjectBridge';
import { ProjectTaskRequest } from '../intake/types/ProjectTaskRequest';
import { ProjectTaskResponse } from '../intake/types/ProjectTaskResponse';
import { ProjectResult } from '../result/types/ProjectResult';
import { ProjectCallback } from '../result/types/ProjectCallback';
import { TaskIntakeGateway } from '../intake/TaskIntakeGateway';
import { SupervisorRuntime } from '../../employee/supervisor/runtime/SupervisorRuntime';
import { ResultBuilder } from '../result/ResultBuilder';
import { WorkflowProgressTracker } from '../../employee/workflow/progress/WorkflowProgressTracker';
import { ProjectEventPublisher } from '../event/ProjectEventPublisher';
import { ProjectEventType } from '../event/types/ProjectEventType';
import { ConstitutionRuntimeGate } from '../../../src/runtime/constitution/ConstitutionRuntimeGate';

export class ProjectBridgeRuntime implements ProjectBridge {
  private static callbacks: Map<string, ProjectCallback> = new Map();
  private supervisor: SupervisorRuntime;

  constructor(supervisor?: SupervisorRuntime) {
    this.supervisor = supervisor || new SupervisorRuntime();
  }

  public registerCallback(callback: ProjectCallback): () => void {
    ProjectBridgeRuntime.callbacks.set(callback.projectId, callback);
    return () => {
      ProjectBridgeRuntime.callbacks.delete(callback.projectId);
    };
  }

  public submitTask(request: ProjectTaskRequest): { response: ProjectTaskResponse; result?: ProjectResult } {
    // 1. Process Intake via TaskIntakeGateway
    const intakeResult = TaskIntakeGateway.processIntake(request);
    const { response, workflowRequest } = intakeResult;

    if (response.status === 'REJECTED' || !workflowRequest) {
      return { response };
    }

    // 2. Delegate Workflow Execution to SupervisorRuntime (without specifying individual AI Employees)
    const targetBlueprintId = workflowRequest.targetBlueprintId || 'bp-wf-e2e-delivery';
    
    ProjectEventPublisher.publish(
      ProjectEventType.WORKFLOW_STARTED,
      request.projectId,
      response.taskId,
      { blueprintId: targetBlueprintId }
    );

    const wfExecution = this.supervisor.instantiateAndOrchestrateWorkflow(targetBlueprintId, response.taskId);
    if (!wfExecution) {
      const errResult: ProjectResult = {
        requestId: request.requestId,
        projectId: request.projectId,
        taskId: response.taskId,
        status: 'FAILED',
        completed: false,
        producedArtifacts: [],
        executionSummary: 'Failed to instantiate Workflow from Blueprint',
        completedAt: new Date().toISOString()
      };
      ProjectEventPublisher.publish(ProjectEventType.WORKFLOW_FAILED, request.projectId, response.taskId, { reason: 'Blueprint not found' });
      return { response, result: errResult };
    }

    const { instance } = wfExecution;

    // Simulate complete stage transitions for testing
    let currentInstance = instance;
    while (currentInstance.currentStageId && currentInstance.status === 'RUNNING') {
      const advanceResult = this.supervisor.advanceWorkflowStage(currentInstance.instanceId.getValue(), [
        `output-${currentInstance.currentStageId.toLowerCase()}.txt`
      ]);
      if (!advanceResult) break;
      currentInstance = advanceResult.instance;
    }

    // 3. Build ProjectResult
    const progress = WorkflowProgressTracker.getProgress(currentInstance.instanceId.getValue());
    const projectResult = ResultBuilder.buildResult(request.requestId, request.projectId, currentInstance, progress);

    // 3b. Constitution Runtime Gate Evaluation (Enforce Skill-Only AIOS Retention & Mandatory Project Return)
    const constitutionDecision = ConstitutionRuntimeGate.evaluateResultArtifacts(
      request.projectId,
      response.taskId,
      projectResult.producedArtifacts.map(art => ({ artifactId: art.artifactId, artifactType: art.artifactType }))
    );

    ProjectEventPublisher.publish(
      ProjectEventType.WORKFLOW_COMPLETED,
      request.projectId,
      response.taskId,
      { 
        status: projectResult.status, 
        producedArtifactsCount: projectResult.producedArtifacts.length,
        mandatoryProjectReturnEnforced: constitutionDecision.mandatoryProjectReturnEnforced,
        aiosRetentionAllowed: constitutionDecision.aiosRetentionAllowed
      }
    );

    // 4. Dispatch Callback if registered
    const cb = ProjectBridgeRuntime.callbacks.get(request.projectId);
    if (cb) {
      if (projectResult.completed && cb.onSuccess) {
        cb.onSuccess(projectResult);
      } else if (!projectResult.completed && cb.onFailure) {
        cb.onFailure(projectResult);
      }
      ProjectEventPublisher.publish(ProjectEventType.CALLBACK_SENT, request.projectId, response.taskId);
    }

    return { response, result: projectResult };
  }

  public static clear(): void {
    this.callbacks.clear();
  }
}
