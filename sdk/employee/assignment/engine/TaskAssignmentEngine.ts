import { AITaskManifest } from '../types/AITaskManifest';
import { AITaskState } from '../types/AITaskState';
import { IAssignmentStrategy, LeastLoadedAssignmentStrategy } from '../strategy/IAssignmentStrategy';
import { TaskDependencyUnmetException, NoEmployeeAvailableException } from '../exceptions/AITaskAssignmentExceptions';

export class TaskAssignmentEngine {
  private tasks: Map<string, AITaskManifest> = new Map();
  private strategy: IAssignmentStrategy;

  constructor(strategy?: IAssignmentStrategy) {
    this.strategy = strategy || new LeastLoadedAssignmentStrategy();
  }

  public registerTask(task: AITaskManifest): void {
    this.tasks.set(task.identity.taskId, task);
  }

  public getTask(taskId: string): AITaskManifest | undefined {
    return this.tasks.get(taskId);
  }

  public assignTask(taskId: string, availableEmployeeIds: string[]): string {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error(`Task ${taskId} not found.`);

    // 1. Verify DAG Dependencies
    for (const depId of task.dependsOnTaskIds) {
      const depTask = this.tasks.get(depId);
      if (!depTask || depTask.state !== AITaskState.COMPLETED) {
        throw new TaskDependencyUnmetException(`Task '${taskId}' cannot be assigned because dependency '${depId}' is not COMPLETED.`);
      }
    }

    // 2. Select Employee via Strategy
    const selectedEmpId = this.strategy.selectEmployee(task, availableEmployeeIds);
    if (!selectedEmpId) {
      throw new NoEmployeeAvailableException(`No available employee could be selected for task '${taskId}'.`);
    }

    task.currentEmployeeId = selectedEmpId;
    task.state = AITaskState.ASSIGNED;
    return selectedEmpId;
  }
}
