/**
 * SupervisorRuntime.ts
 * 
 * Supervisor Runtime Engine managing Task Intake ➔ Analysis ➔ Worker Selection ➔ Directive Assignment ➔ Coordination
 */

import { CandidateWorker, WorkerSelectionStrategy } from './WorkerSelectionStrategy';
import { WorkerSelector } from './WorkerSelector';
import { AssignmentPlanner } from './AssignmentPlanner';
import { ExecutionCoordinator } from './ExecutionCoordinator';
import { WorkerAssignment } from '../types/WorkerAssignment';
import { EmployeeProvisioningService } from '../../provisioning/EmployeeProvisioningService';
import { EmployeeState } from '../../provisioning/types/EmployeeState';

export class SupervisorRuntime {
  private supervisorId: string;
  private selector: WorkerSelector;

  constructor(supervisorId: string = 'emp-supervisor-01', strategy?: WorkerSelectionStrategy) {
    this.supervisorId = supervisorId;
    this.selector = new WorkerSelector(strategy);
  }

  public orchestrateAssignment(
    taskId: string,
    requiredCapabilities: string[] = []
  ): WorkerAssignment | null {
    // 1. Gather all provisioned candidate workers
    const profiles = EmployeeProvisioningService.getAllProfiles();
    const candidateWorkers: CandidateWorker[] = profiles
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

    // 2. Select optimal worker using strategy
    const selection = this.selector.selectOptimalWorker(candidateWorkers, requiredCapabilities);
    if (!selection) {
      return null;
    }

    // 3. Plan Worker Assignment & Directives
    const assignment = AssignmentPlanner.planAssignment(this.supervisorId, taskId, selection);

    // 4. Update status of worker
    EmployeeProvisioningService.updateStatus(assignment.workerId, {
      state: EmployeeState.ASSIGNED,
      currentTask: taskId,
      load: 0.5
    });

    // 5. Dispatch via ExecutionCoordinator
    ExecutionCoordinator.dispatchAssignment(assignment);

    return assignment;
  }
}
