/**
 * AIOS Employee Execution Runtime Foundation
 * Gateway for Tool Authorization and Execution Routing
 */

import { TaskRecord } from '../task-assignment/models/TaskAssignmentModels';
import { IExecutor, IToolExecutionGateway } from './contract/IExecutor';
import { ExecutionResult } from './models/ExecutionRuntimeModels';

export class ToolExecutionGateway implements IToolExecutionGateway {
  public async executeTool(
    executor: IExecutor,
    task: TaskRecord,
    toolName: string,
    params: any
  ): Promise<ExecutionResult> {
    // 1. Tool Whitelist Check
    if (!task.allowedTools.includes(toolName)) {
      throw new Error(
        `[Tool Gateway Block] Tool '${toolName}' is not authorized for Task '${task.taskId}'. Allowed tools: [${task.allowedTools.join(', ')}]`
      );
    }

    // 2. Delegate execution to Executor (Executor performs pure execution without decision-making)
    return await executor.execute(task, toolName, params);
  }
}
