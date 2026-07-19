import { InitializationTask } from "./InitializationTask";
import { InitializationRequest } from "./contracts/DistrictInitializationIntegrationContract";

export type TaskHandler = (
  task: InitializationTask,
  request: InitializationRequest,
  baseDir: string
) => Promise<void>;

export class InitializationExecutor {
  private readonly handlers = new Map<string, TaskHandler>();

  /**
   * Registers a callback handler to execute a specific task type.
   */
  public registerHandler(agentType: string, handler: TaskHandler): void {
    this.handlers.set(agentType, handler);
  }

  /**
   * Executes the task by routing it to its registered handler.
   */
  public async execute(
    task: InitializationTask,
    request: InitializationRequest,
    baseDir: string
  ): Promise<void> {
    const handler = this.handlers.get(task.agentType);
    if (!handler) {
      throw new Error(`No task handler registered for agentType: '${task.agentType}'`);
    }
    await handler(task, request, baseDir);
  }
}
