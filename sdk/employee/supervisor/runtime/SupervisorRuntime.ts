/**
 * SupervisorRuntime.ts
 * 
 * Supervisor Runtime Engine managing Task Intake ➔ Analysis ➔ Worker Selection ➔ Directive Assignment ➔ Workflow Orchestration
 */

import { CandidateWorker, WorkerSelectionStrategy } from './WorkerSelectionStrategy';
import { WorkerSelector, SelectedWorkerResult } from './WorkerSelector';
import { AssignmentPlanner } from './AssignmentPlanner';
import { ExecutionCoordinator } from './ExecutionCoordinator';
import { WorkerAssignment } from '../types/WorkerAssignment';
import { EmployeeProvisioningService } from '../../provisioning/EmployeeProvisioningService';
import { EmployeeState } from '../../provisioning/types/EmployeeState';
import { WorkflowBlueprintRegistry } from '../../workflow/blueprint/registry/WorkflowBlueprintRegistry';
import { WorkflowFactory } from '../../workflow/blueprint/WorkflowFactory';
import { WorkflowInstanceRegistry } from '../../workflow/registry/WorkflowInstanceRegistry';
import { WorkflowInstance } from '../../workflow/types/WorkflowInstance';
import { WorkflowStage } from '../../workflow/stage/types/WorkflowStage';
import { WorkflowCoordinator } from '../../workflow/routing/WorkflowCoordinator';
import { WorkflowRouter } from '../../workflow/routing/WorkflowRouter';
import { WorkflowEventPublisher } from '../../workflow/event/WorkflowEventPublisher';
import { WorkflowEventType } from '../../workflow/event/types/WorkflowEventType';

export class SupervisorRuntime {
  private supervisorId: string;
  private selector: WorkerSelector;
  private workflowCoordinator: WorkflowCoordinator;

  constructor(supervisorId: string = 'emp-supervisor-01', strategy?: WorkerSelectionStrategy) {
    this.supervisorId = supervisorId;
    this.selector = new WorkerSelector(strategy);
    this.workflowCoordinator = new WorkflowCoordinator();
  }

  private getCandidateWorkers(): CandidateWorker[] {
    const profiles = EmployeeProvisioningService.getAllProfiles();
    return profiles
      .filter((p) => p.identity.employeeId !== this.supervisorId)
      .map((p) => ({
        profile: p,
        status: EmployeeProvisioningService.getStatus(p.identity.employeeId) || {
          employeeId: p.identity.employeeId,
          state: EmployeeState.IDLE,
          lastHeartbeat: new Date().toISOString(),
          load: 0.0
        }
      }));
  }

  public orchestrateAssignment(
    taskId: string,
    requiredCapabilities: string[] = []
  ): WorkerAssignment | null {
    const candidateWorkers = this.getCandidateWorkers();
    const selection = this.selector.selectOptimalWorker(candidateWorkers, requiredCapabilities);
    if (!selection) {
      return null;
    }

    const assignment = AssignmentPlanner.planAssignment(this.supervisorId, taskId, selection);
    EmployeeProvisioningService.updateStatus(assignment.workerId, {
      state: EmployeeState.ASSIGNED,
      currentTask: taskId,
      load: 0.5
    });

    ExecutionCoordinator.dispatchAssignment(assignment);
    return assignment;
  }

  /**
   * Instantiates a Workflow from Blueprint and orchestrates execution of its first stage
   */
  public instantiateAndOrchestrateWorkflow(
    blueprintId: string,
    taskId: string
  ): { instance: WorkflowInstance; assignment: WorkerAssignment | null } | null {
    const blueprint = WorkflowBlueprintRegistry.find(blueprintId);
    if (!blueprint) {
      return null;
    }

    const instance = WorkflowFactory.createInstanceFromBlueprint(blueprint, taskId);
    WorkflowInstanceRegistry.register(instance);

    WorkflowEventPublisher.publish(
      WorkflowEventType.WORKFLOW_CREATED,
      instance.instanceId.getValue(),
      taskId,
      { blueprintId, workflowName: blueprint.workflowName }
    );

    const candidates = this.getCandidateWorkers();
    const currentStage = instance.stages.find((s: WorkflowStage) => s.stageId.getValue() === instance.currentStageId);

    let assignment: WorkerAssignment | null = null;
    if (currentStage) {
      const selectedWorker = this.workflowCoordinator.selectWorkerForStage(currentStage, candidates);
      if (selectedWorker) {
        this.workflowCoordinator.executeStage(instance, currentStage, selectedWorker);
        
        const selectionResult: SelectedWorkerResult = {
          worker: selectedWorker,
          evaluation: {
            matchScore: 1.0,
            permissionScore: 1.0,
            availabilityScore: 1.0,
            compositeScore: 1.0,
            reason: 'Selected via Workflow Stage Profession Assignment'
          }
        };

        assignment = AssignmentPlanner.planAssignment(this.supervisorId, taskId, selectionResult);
        EmployeeProvisioningService.updateStatus(assignment.workerId, {
          state: EmployeeState.ASSIGNED,
          currentTask: taskId,
          load: 0.5
        });
        ExecutionCoordinator.dispatchAssignment(assignment);
      }
    }

    return { instance, assignment };
  }

  /**
   * Advances the current stage of a WorkflowInstance and assigns the next worker for the next stage
   */
  public advanceWorkflowStage(
    instanceId: string,
    producedArtifacts: string[] = []
  ): { instance: WorkflowInstance; nextAssignment: WorkerAssignment | null } | null {
    const instance = WorkflowInstanceRegistry.find(instanceId);
    if (!instance || !instance.currentStageId) {
      return null;
    }

    const nextStage = WorkflowRouter.completeStage(instance, instance.currentStageId, producedArtifacts);
    let nextAssignment: WorkerAssignment | null = null;

    if (nextStage) {
      const candidates = this.getCandidateWorkers();
      const selectedWorker = this.workflowCoordinator.selectWorkerForStage(nextStage, candidates);
      if (selectedWorker) {
        this.workflowCoordinator.executeStage(instance, nextStage, selectedWorker);

        const selectionResult: SelectedWorkerResult = {
          worker: selectedWorker,
          evaluation: {
            matchScore: 1.0,
            permissionScore: 1.0,
            availabilityScore: 1.0,
            compositeScore: 1.0,
            reason: 'Selected via Workflow Stage Profession Assignment'
          }
        };

        nextAssignment = AssignmentPlanner.planAssignment(this.supervisorId, instance.taskId, selectionResult);
        EmployeeProvisioningService.updateStatus(nextAssignment.workerId, {
          state: EmployeeState.ASSIGNED,
          currentTask: instance.taskId,
          load: 0.5
        });
        ExecutionCoordinator.dispatchAssignment(nextAssignment);
      }
    }

    return { instance, nextAssignment };
  }
}
